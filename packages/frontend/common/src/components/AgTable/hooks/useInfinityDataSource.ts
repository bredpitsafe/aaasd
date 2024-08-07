import { withDeltaTime } from '@common/rx';
import type { GridApi, GridOptions, IGetRowsParams, SortModelItem } from '@frontend/ag-grid';
import { isNil, once } from 'lodash-es';
import type { Logger } from 'pino';
import { useCallback, useEffect, useMemo } from 'react';
import type { Observable, OperatorFunction } from 'rxjs';
import { BehaviorSubject, EMPTY, EmptyError, ReplaySubject, timer } from 'rxjs';
import {
    catchError,
    debounceTime,
    filter,
    groupBy,
    map,
    mergeMap,
    scan,
    switchMap,
    tap,
} from 'rxjs/operators';

import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { loggerInfinityHistory } from '../../../utils/Tracing/Children/InfinityHistory';
import { EVENT_GRID_FIRST_SERVER_DATA_RECEIVED } from '../defs.ts';
import { agTableLogger } from '../logger.ts';
import { getGridId } from '../utils.ts';

const DEBOUNCE_TIMEOUT = 32;
const GROUP_TTL = 60_000;

export type TDataSourceGetRowsProps<Row extends Record<string, unknown>, FilterModel = unknown> = {
    lastRow: undefined | Row;
    startIndex: number;
    endIndex: number;
    sortModel: SortModelItem[];
    filterModel: FilterModel;
};

type TGetRows<Row extends Record<string, unknown>, FilterModel = unknown> = (
    props: TDataSourceGetRowsProps<Row, FilterModel>,
) => Observable<Row[]>;

export type TUseInfinityDataSourceProps<
    Row extends Record<string, unknown>,
    FilterModel = unknown,
> = {
    blockSize?: number;
    maxBlocks?: number;

    getRows: TGetRows<Row, FilterModel>;
    refreshInfiniteCacheTrigger$?: undefined | Observable<unknown>;

    onReceiveRows?: (rows: Row[]) => void;
};

export function useInfinityDataSource<Item extends Record<string, unknown>, FilterModel = unknown>(
    gridApi: undefined | GridApi,
    props: TUseInfinityDataSourceProps<Item, FilterModel>,
): Pick<
    GridOptions<Item>,
    | 'rowModelType'
    | 'defaultColDef'
    | 'blockLoadDebounceMillis'
    | 'maxBlocksInCache'
    | 'cacheBlockSize'
    | 'datasource'
> {
    const gridId = getGridId(gridApi);

    const logger = useMemo(
        () => agTableLogger.child([new Binding('InfinityDataSource'), new Binding(gridId)]),
        [gridId],
    );
    const getRows$ = useMemo(() => new ReplaySubject<TGetRows<Item, FilterModel>>(), []);
    const rowsParams$ = useMemo(
        () => new BehaviorSubject<IGetRowsParams | undefined>(undefined),
        [],
    );

    const getRows = useCallback(
        (params: IGetRowsParams) => {
            if (isNil(gridApi)) {
                logger.trace('request before gridApi is ready', {
                    startRow: params.startRow,
                    endRow: params.endRow,
                    filterModel: params.filterModel,
                });
                return;
            }

            logger.trace('rowsParams update', {
                startRow: params.startRow,
                endRow: params.endRow,
                filterModel: params.filterModel,
            });
            rowsParams$.next(params);
        },
        [gridApi, logger, rowsParams$],
    );

    useEffect(() => {
        const lastParams = rowsParams$.getValue();
        if (!isNil(lastParams)) {
            lastParams.failCallback();
            rowsParams$.next(undefined);
        }

        getRows$.next(props.getRows);
    }, [gridApi, rowsParams$, getRows$, props.getRows]);

    useEffect(() => {
        if (isNil(gridApi)) return;

        const onFirstResponseOnce = once(
            gridApiReactionOnFirstResponse.bind(null, gridApi, logger),
        );
        const subscription = getRows$
            .pipe(
                tap(() => gridApiReactionOnStartLoading(gridApi, logger)),
                debounceTime(DEBOUNCE_TIMEOUT),
                switchMap((getRows) => {
                    // For every new getRows(for first request) we have special reactions that we need to execute only once
                    const onError = gridApiReactionOnError.bind(null, gridApi, logger);
                    const onItems = gridApiReactionOnItems.bind(null, gridApi, logger);
                    const onItemsOnce = once(
                        gridApiReactionOnFirstItems.bind(null, gridApi, logger),
                    );
                    const onErrorOnce = once(
                        gridApiReactionOnFirstError.bind(null, gridApi, logger),
                    );

                    return rowsParams$.pipe(
                        filter((params): params is IGetRowsParams => !isNil(params)),
                        groupBy((params) => params.startRow, {
                            duration: debounceTime(GROUP_TTL),
                        }),
                        mergeMap((group$) => {
                            return group$.pipe(
                                prevNext<IGetRowsParams>(),
                                tap(({ prev }) => prev?.failCallback()),
                                map(({ next }) => next),
                                filter((params): params is IGetRowsParams => !isNil(params)),
                                withDeltaTime(),
                                switchMap(([params, delta]) => {
                                    const lastRow =
                                        params.startRow === 0
                                            ? undefined
                                            : gridApi.getModel().getRow(params.startRow - 1)?.data;

                                    const getRowsParams = {
                                        lastRow,
                                        startIndex: params.startRow,
                                        endIndex: params.endRow,
                                        sortModel: params.sortModel,
                                        filterModel: params.filterModel,
                                    };

                                    logger.trace('get rows', getRowsParams);
                                    const rows$ = getRows(getRowsParams);

                                    return (
                                        delta > DEBOUNCE_TIMEOUT
                                            ? rows$
                                            : timer(DEBOUNCE_TIMEOUT - delta).pipe(
                                                  mergeMap(() => rows$),
                                              )
                                    ).pipe(
                                        tap((items) => {
                                            logger.trace('receive rows', {
                                                items: items.length,
                                            });
                                            props.onReceiveRows?.(items);
                                            onFirstResponseOnce();
                                            onItemsOnce(params, items);
                                            onItems(params, items);
                                        }),
                                        catchError((error) => {
                                            logger.error('receive rows error', {
                                                error,
                                            });
                                            onErrorOnce();
                                            onError(params, error);
                                            // getRows should not to complete all pipeline on Error
                                            return EMPTY;
                                        }),
                                    );
                                }),
                            );
                        }),
                    );
                }),
            )
            .subscribe();

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowsParams$, getRows$, gridApi]);

    useEffect(() => {
        if (gridApi === undefined || props.refreshInfiniteCacheTrigger$ === undefined) return;

        const sub = props.refreshInfiniteCacheTrigger$.subscribe(() => {
            logger.trace('refresh infinite cache by trigger');
            gridApi.refreshInfiniteCache();
        });

        return () => sub.unsubscribe();
    }, [gridApi, logger, props.refreshInfiniteCacheTrigger$]);

    return useMemo(() => {
        return {
            rowModelType: 'infinite',
            datasource: { getRows },
            defaultColDef: { sortable: false, filter: false },
            cacheBlockSize: props.blockSize ?? 300,
            maxBlocksInCache: props.maxBlocks ?? 100,
        };
    }, [getRows, props.blockSize, props.maxBlocks]);
}

function gridApiReactionOnStartLoading(gridApi: GridApi, logger: Logger) {
    logger.trace('start loading first chunk');
    gridApi.setRowCount(1);
    gridApi.purgeInfiniteCache();
    gridApi.showLoadingOverlay();
}

function gridApiReactionOnFirstResponse(gridApi: GridApi, logger: Logger) {
    gridApi.dispatchEvent({ type: EVENT_GRID_FIRST_SERVER_DATA_RECEIVED });
    logger.trace('first response event');
}

function gridApiReactionOnFirstItems<T>(
    gridApi: GridApi,
    logger: Logger,
    params: IGetRowsParams,
    items: T[],
) {
    logger.trace('first items event', {
        items: items.length,
        startRow: params.startRow,
        endRow: params.endRow,
        sortModel: params.sortModel,
        filterModel: params.filterModel,
    });
    if (params.startRow === 0 && items.length === 0) {
        gridApi.showNoRowsOverlay();
        logger.trace('items array empty, show no rows overlay');
    }
}

function gridApiReactionOnFirstError(gridApi: GridApi, logger: Logger) {
    logger.trace('first error event, show no rows overlay');
    gridApi.showNoRowsOverlay();
}

function gridApiReactionOnItems<T>(
    gridApi: GridApi,
    logger: Logger,
    params: IGetRowsParams,
    items: T[],
) {
    logger.trace('items event', {
        items: items.length,
        startRow: params.startRow,
        endRow: params.endRow,
        sortModel: params.sortModel,
        filterModel: params.filterModel,
    });

    if (items.length > 0) {
        logger.trace('items array not empty, hide overlay');
        gridApi.hideOverlay();
    }

    const lastRow =
        items.length < params.endRow - params.startRow ? params.startRow + items.length : undefined;

    logger.trace('grid success callback', { items: items.length, lastRow });
    params.successCallback(
        items,
        items.length < params.endRow - params.startRow ? params.startRow + items.length : undefined,
    );
}

function gridApiReactionOnError(
    gridApi: GridApi,
    logger: Logger,
    params: IGetRowsParams,
    error: Error,
) {
    logger.trace('error', {
        error,
        startRow: params.startRow,
        endRow: params.endRow,
        sortModel: params.sortModel,
        filterModel: params.filterModel,
    });
    if (!(error instanceof EmptyError)) {
        loggerInfinityHistory.error(`getRows fail`, error, {
            // don't send all params, because it cannot be serialized
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel,
        });
    }

    logger.trace('grid fail callback');
    params.failCallback();
}

function prevNext<T>(): OperatorFunction<T, { prev: undefined | T; next: undefined | T }> {
    return scan((acc, obj) => ({ prev: acc.next, next: obj }), {
        prev: undefined,
        next: undefined,
    } as {
        prev: undefined | T;
        next: undefined | T;
    });
}

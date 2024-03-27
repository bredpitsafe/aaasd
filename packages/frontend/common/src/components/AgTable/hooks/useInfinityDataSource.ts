import type { GridApi, GridOptions, IGetRowsParams, SortModelItem } from '@frontend/ag-grid';
import { isNil, once } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    BehaviorSubject,
    EMPTY,
    EmptyError,
    Observable,
    OperatorFunction,
    ReplaySubject,
    timer,
} from 'rxjs';
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

import { withDeltaTime } from '../../../utils/Rx/withDeltaTime';
import { loggerInfinityHistory } from '../../../utils/Tracing/Children/InfinityHistory';

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
    const isReady = useRef(false);
    const getRows$ = useMemo(() => new ReplaySubject<TGetRows<Item, FilterModel>>(), []);
    const rowsParams$ = useMemo(
        () => new BehaviorSubject<IGetRowsParams | undefined>(undefined),
        [],
    );

    const getRows = useCallback(
        (params: IGetRowsParams) => {
            if (isNil(gridApi) || !isReady.current) {
                params.failCallback();
                return;
            }

            rowsParams$.next(params);
        },
        [rowsParams$, gridApi],
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

        const onFirstResponseOnce = once(gridApiReactionOnFirstResponse.bind(null, gridApi));
        const subscription = getRows$
            .pipe(
                tap(() => gridApiReactionOnStartLoading(gridApi)),
                debounceTime(DEBOUNCE_TIMEOUT),
                switchMap((getRows) => {
                    // For every new getRows(for first request) we have special reactions that we need to execute only once
                    const onError = gridApiReactionOnError.bind(null, gridApi);
                    const onItems = gridApiReactionOnItems.bind(null, gridApi);
                    const onItemsOnce = once(gridApiReactionOnFirstItems.bind(null, gridApi));
                    const onErrorOnce = once(gridApiReactionOnFirstError.bind(null, gridApi));

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
                                    const rows$ = getRows({
                                        lastRow,
                                        startIndex: params.startRow,
                                        endIndex: params.endRow,
                                        sortModel: params.sortModel,
                                        filterModel: params.filterModel,
                                    });

                                    return (
                                        delta > DEBOUNCE_TIMEOUT
                                            ? rows$
                                            : timer(DEBOUNCE_TIMEOUT - delta).pipe(
                                                  mergeMap(() => rows$),
                                              )
                                    ).pipe(
                                        tap((items) => {
                                            props.onReceiveRows?.(items);
                                            onFirstResponseOnce();
                                            onItemsOnce(params, items);
                                            onItems(params, items);
                                        }),
                                        catchError((error) => {
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
            gridApi.refreshInfiniteCache();
        });

        return () => sub.unsubscribe();
    }, [gridApi, props.refreshInfiniteCacheTrigger$]);

    // AgGrid will make a first request to getRows() without initial sort/filter state
    // https://github.com/ag-grid/ag-grid/issues/1785
    useEffect(() => {
        if (gridApi === undefined || isReady.current) return;

        const id = setTimeout(
            () => {
                isReady.current = true;
                gridApi.purgeInfiniteCache();
            },
            // I hope 100ms is enough to initialize ag-grid internal state at every case
            100,
        );

        return () => clearTimeout(id);
    }, [gridApi]);

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

function gridApiReactionOnStartLoading(gridApi: GridApi) {
    gridApi.setRowCount(1);
    gridApi.purgeInfiniteCache();
    gridApi.showLoadingOverlay();
}

function gridApiReactionOnFirstResponse(gridApi: GridApi) {
    gridApi.dispatchEvent({ type: 'firstInfinityRowReceived' });
}

function gridApiReactionOnFirstItems<T>(gridApi: GridApi, params: IGetRowsParams, items: T[]) {
    if (params.startRow === 0 && items.length === 0) {
        gridApi.showNoRowsOverlay();
    }
}

function gridApiReactionOnFirstError(gridApi: GridApi) {
    gridApi.showNoRowsOverlay();
}

function gridApiReactionOnItems<T>(gridApi: GridApi, params: IGetRowsParams, items: T[]) {
    if (items.length > 0) {
        gridApi.hideOverlay();
    }

    params.successCallback(
        items,
        items.length < params.endRow - params.startRow ? params.startRow + items.length : undefined,
    );
}

function gridApiReactionOnError(gridApi: GridApi, params: IGetRowsParams, error: Error) {
    if (!(error instanceof EmptyError)) {
        loggerInfinityHistory.error(`getRows fail`, error, {
            // don't send all params, because it cannot be serialized
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel,
        });
    }

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

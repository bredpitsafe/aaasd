import type { Assign } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import type {
    ColDefField,
    GridOptions,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    LoadSuccessParams,
    SortModelItem,
} from '@frontend/ag-grid';
import { RowNodeBlock } from '@frontend/ag-grid';
import hash_sum from 'hash-sum';
import { isNil, pickBy, sortBy } from 'lodash-es';
import type { Logger } from 'pino';
import { useMemo } from 'react';
import { useUnmount } from 'react-use';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { useModule } from '../../../di/react.tsx';
import type { ESortOrder } from '../../../types/domain/pagination.ts';
import { Fail } from '../../../types/Fail.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError.ts';
import { EMPTY_OBJECT } from '../../../utils/const.ts';
import { ModuleNotifyErrorAndFail } from '../../../utils/Rx/ModuleNotify.ts';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { convertErrToGrpcFail } from '../../../utils/ValueDescriptor/Fails.ts';
import type { TGrpcFail, TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
    matchValueDescriptor,
} from '../../../utils/ValueDescriptor/utils.ts';
import { agTableLogger } from '../logger.ts';
import { useGridApi } from './useGridApi.ts';
import { useGridId } from './useGridId.ts';

type TSSRMRawResponseDesc<RecordType> = TValueDescriptor2<{ rows: RecordType[]; total?: number }>;

type TSSRMRowsParams<RecordType> = Assign<
    IServerSideGetRowsParams<RecordType>,
    {
        request: Assign<
            IServerSideGetRowsRequest,
            {
                startRow: number;
                endRow: number;
            }
        >;
    }
>;

type TCallbacks<RecordType> = {
    success: (
        params: TSSRMRowsParams<RecordType>,
        rowData: RecordType[],
        rowCount?: number,
    ) => void;
    fail: (params: TSSRMRowsParams<RecordType>, fail: TGrpcFail) => void;
};

export function useAgGridServerRowModel<RecordType>(
    subscription: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<ColDefField<RecordType>, { filterType: string }>;
        sort: {
            field: keyof RecordType;
            sort: ESortOrder;
        }[];
    }) => Observable<TSSRMRawResponseDesc<RecordType>>,
    {
        cacheBlockSize = 100,
        maxBlocksInCache = 1,
        blockLoadDebounceMillis = 500,
    }: Partial<{
        cacheBlockSize: number;
        maxBlocksInCache: number;
        blockLoadDebounceMillis: number;
    }> = EMPTY_OBJECT,
): { rowModelType: 'serverSide' } & Required<
    Pick<GridOptions<RecordType>, 'serverSideDatasource' | 'onGridReady'>
> {
    const notifyErrorAndFail: () => MonoTypeOperatorFunction<TSSRMRawResponseDesc<RecordType>> =
        useModule(ModuleNotifyErrorAndFail);

    const { gridApi, onGridReady } = useGridApi();
    const gridId = useGridId(gridApi);
    const logger = useMemo(
        () => agTableLogger.child([new Binding('SRM'), new Binding(gridId)]),
        [gridId],
    );
    const subscriptionsManager = useMemo(
        () => new SubscriptionsManager<RecordType>(notifyErrorAndFail, logger),
        [notifyErrorAndFail, logger],
    );

    useUnmount(() => subscriptionsManager.clear());

    return useMemo(() => {
        subscriptionsManager.registerSubscription(subscription);

        return {
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows(params: TSSRMRowsParams<RecordType>) {
                    logger.trace('get rows', {
                        startRow: params.request.startRow,
                        endRow: params.request.endRow,
                        filterModel: params.request.filterModel,
                        sortModel: params.request.sortModel,
                    });
                    if (isNil(params.request.startRow) || isNil(params.request.endRow)) {
                        params.fail();
                        return;
                    }

                    subscriptionsManager.registerSearchParams(params, {
                        success(
                            params: TSSRMRowsParams<RecordType>,
                            rowData: RecordType[],
                            rowCount?: number,
                        ) {
                            logger.trace('success callback', {
                                items: rowData.length,
                            });

                            params.success(
                                pickBy<LoadSuccessParams>(
                                    {
                                        rowData,
                                        rowCount,
                                    },
                                    (value) => !isNil(value),
                                ) as LoadSuccessParams,
                            );
                        },
                        fail(params: TSSRMRowsParams<RecordType>, fail: TGrpcFail) {
                            logger.trace('fail callback', {
                                fail,
                            });

                            params.fail();
                        },
                    });
                },
                destroy() {
                    logger.trace('destroy');
                    subscriptionsManager.clear();
                },
            },
            defaultColDef: { sortable: false, filter: false },
            cacheBlockSize,
            maxBlocksInCache,
            blockLoadDebounceMillis,
            onGridReady,
        };
    }, [
        subscriptionsManager,
        subscription,
        cacheBlockSize,
        maxBlocksInCache,
        blockLoadDebounceMillis,
        onGridReady,
        logger,
    ]);
}

class ActiveParamsManager<RecordType> {
    private requestsParams = new Map<number, TSSRMRowsParams<RecordType>>();
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger.child(new Binding('ActiveParamsManager'));
    }

    registerNewRequestParams(params: TSSRMRowsParams<RecordType>) {
        this.requestsParams.set(params.request.startRow, params);

        const blockBoundParams = (
            Object.values(params.api.getCacheBlockState() ?? {}) as {
                startRow: number;
                pageStatus: string;
            }[]
        ).reduce(
            (acc, { startRow, pageStatus }) => {
                if (pageStatus !== RowNodeBlock.STATE_WAITING_TO_LOAD) {
                    acc.add(startRow);
                }
                return acc;
            },
            new Set<number>([params.request.startRow]),
        );

        this.requestsParams.forEach((_, startRow) => {
            if (!blockBoundParams.has(startRow)) {
                this.requestsParams.delete(startRow);
            }
        });

        this.logger.trace('register new request params', this.requestsParams);
    }

    getGroupedRange() {
        const groupedRange = sortBy(
            Array.from(this.requestsParams.values()),
            (params) => params.request.startRow,
        ).reduce(
            (acc, params) => {
                const lastElement = acc.at(-1);

                if (isNil(lastElement) || lastElement.endRow !== params.request.startRow) {
                    acc.push({
                        startRow: params.request.startRow,
                        endRow: params.request.endRow,
                    });
                } else {
                    lastElement.endRow = params.request.endRow;
                }

                return acc;
            },
            [] as { startRow: number; endRow: number }[],
        );
        this.logger.trace('grouped range', groupedRange);
        return groupedRange;
    }

    getParams(startRow: number, endRow: number) {
        const result: TSSRMRowsParams<RecordType>[] = [];

        this.requestsParams.forEach((value, key) => {
            if (startRow <= key && key <= endRow) {
                result.push(value);
            }
        });

        if (result.length === 0) {
            this.logger.warn(`Trying to send data to AgGrid but no active requests were found`);
        }

        this.logger.trace('get params', { results: result.length });
        return result;
    }

    clear() {
        this.requestsParams.clear();
        this.logger.trace('clear params');
    }
}

class SubscriptionsManager<RecordType> {
    private paramsHash: string | undefined = undefined;
    private readonly subscriptions = new Map<
        number,
        Readonly<{
            destroy$: Subject<void>;
            startRow: number;
            endRow: number;
        }>
    >();
    private readonly cache = new Map<
        number,
        { startRow: number; endRow: number; recordsDesc: TValueDescriptor2<RecordType[]> }
    >();
    private filter: Record<ColDefField<RecordType>, { filterType: string }> | undefined = undefined;
    private sort:
        | {
              field: keyof RecordType;
              sort: ESortOrder;
          }[]
        | undefined = undefined;
    private subscription:
        | ((params: {
              pagination: { limit: number; offset: number };
              filter: Record<ColDefField<RecordType>, { filterType: string }>;
              sort: {
                  field: keyof RecordType;
                  sort: ESortOrder;
              }[];
          }) => Observable<TSSRMRawResponseDesc<RecordType>>)
        | undefined = undefined;
    private readonly activeParamsManager: ActiveParamsManager<RecordType>;
    private readonly logger: Logger;

    constructor(
        private notifyErrorAndFail: () => MonoTypeOperatorFunction<
            TSSRMRawResponseDesc<RecordType>
        >,
        logger: Logger,
    ) {
        this.activeParamsManager = new ActiveParamsManager<RecordType>(logger);
        this.logger = logger.child(new Binding('SubscriptionsManager'));
    }

    registerSubscription(
        subscription: (params: {
            pagination: { limit: number; offset: number };
            filter: Record<ColDefField<RecordType>, { filterType: string }>;
            sort: {
                field: keyof RecordType;
                sort: ESortOrder;
            }[];
        }) => Observable<TSSRMRawResponseDesc<RecordType>>,
    ) {
        this.clear();

        this.subscription = subscription;
        this.logger.trace('register subscription');
    }

    registerSearchParams(params: TSSRMRowsParams<RecordType>, callbacks: TCallbacks<RecordType>) {
        this.updatePagingData(params);

        this.activeParamsManager.registerNewRequestParams(params);

        this.processGridRequest(callbacks);

        this.tryProcessRequestFromCache(params, callbacks);
    }

    private updatePagingData(params: TSSRMRowsParams<RecordType>) {
        const requestParamsHash = hash_sum([params.request.filterModel, params.request.sortModel]);

        if (this.paramsHash !== requestParamsHash) {
            this.clear();

            this.paramsHash = requestParamsHash;
            this.filter = params.request.filterModel as Record<
                ColDefField<RecordType>,
                { filterType: string }
            >;
            this.sort = params.request.sortModel.map(({ colId, sort }: SortModelItem) => ({
                field: colId as keyof RecordType,
                sort: sort as ESortOrder,
            }));

            this.logger.trace('register search params', {
                hash: this.paramsHash,
                sort: this.sort,
                filter: this.filter,
            });
        }
    }

    private processGridRequest(callbacks: TCallbacks<RecordType>) {
        assert(!isNil(this.subscription), 'Subscription is not set');
        assert(!isNil(this.filter), 'Filter is not set');
        assert(!isNil(this.sort), 'Sort is not set');

        const requestRanges = this.activeParamsManager.getGroupedRange();

        const missingRangesStarts = new Set<number>(requestRanges.map(({ startRow }) => startRow));

        this.subscriptions.forEach(({ destroy$, startRow, endRow }) => {
            const coveredRange = requestRanges.find(
                (range) => range.startRow >= startRow && range.endRow <= endRow,
            );

            if (isNil(coveredRange)) {
                destroy$.next();
            } else {
                missingRangesStarts.delete(coveredRange.startRow);
            }
        });

        const missingRanges = requestRanges.filter(({ startRow }) =>
            missingRangesStarts.has(startRow),
        );

        for (const { startRow, endRow } of missingRanges) {
            const limit = endRow - startRow;
            const offset = startRow;

            this.logger.trace('missing range', {
                startRow,
                endRow,
                limit,
                offset,
                filter: this.filter,
                sort: this.sort,
            });
            const destroy$ = new Subject<void>();

            this.subscription({
                pagination: { limit, offset },
                filter: this.filter,
                sort: this.sort,
            })
                .pipe(
                    this.notifyErrorAndFail(),
                    catchError((err) =>
                        of(
                            createUnsyncedValueDescriptor(
                                err instanceof Error
                                    ? convertErrToGrpcFail(err)
                                    : Fail(EGrpcErrorCode.UNKNOWN, {
                                          message: 'Unknown error',
                                      }),
                            ),
                        ),
                    ),
                    takeUntil(destroy$),
                )
                .subscribe({
                    next: (desc) => {
                        matchValueDescriptor(desc, {
                            synced: ({ value: { rows, total } }) => {
                                if (!isNil(total)) {
                                    const calculatesPageSize = Math.min(
                                        Math.max(0, total - offset),
                                        limit,
                                    );

                                    if (rows.length !== calculatesPageSize) {
                                        this.logger.error(
                                            `Requested page size ${limit} with offset ${offset}, got ${rows.length} should be ${calculatesPageSize}`,
                                        );
                                    }
                                }

                                this.logger.trace('set cache synced', {
                                    startRow,
                                    endRow,
                                    items: rows.length,
                                });

                                this.cache.set(startRow, {
                                    startRow,
                                    endRow,
                                    recordsDesc: createSyncedValueDescriptor(rows),
                                });

                                this.activeParamsManager
                                    .getParams(startRow, endRow)
                                    .forEach((params) => {
                                        const startIndex = params.request.startRow - startRow;
                                        const endIndex = params.request.endRow - startRow;

                                        callbacks.success(
                                            params,
                                            rows.slice(startIndex, endIndex),
                                            total,
                                        );
                                    });
                            },
                            unsynced: (desc) => {
                                if (isFailValueDescriptor(desc)) {
                                    this.logger.trace('set cache unsynced', {
                                        startRow,
                                        endRow,
                                        fail: desc.fail,
                                    });

                                    this.cache.set(startRow, {
                                        startRow,
                                        endRow,
                                        recordsDesc: desc,
                                    });

                                    this.activeParamsManager
                                        .getParams(startRow, endRow)
                                        .forEach((params) => callbacks.fail(params, desc.fail));
                                }
                            },
                        });
                    },
                    complete: () => {
                        this.subscriptions.delete(startRow);
                        this.cache.delete(startRow);
                    },
                });

            const replacedSubscription = this.subscriptions.get(startRow);
            if (!isNil(replacedSubscription)) {
                replacedSubscription.destroy$.next();
                this.logger.warn(
                    `Removing old nested subscription for [${startRow}, ${replacedSubscription.endRow}] when requesting [${startRow}, ${endRow}]`,
                );
            }

            this.subscriptions.set(startRow, {
                destroy$,
                startRow,
                endRow,
            });
        }
    }

    private getCachedData(params: TSSRMRowsParams<RecordType>) {
        for (const { startRow, endRow, recordsDesc } of this.cache.values()) {
            if (startRow <= params.request.startRow && params.request.endRow <= endRow) {
                if (isSyncedValueDescriptor(recordsDesc)) {
                    const startIndex = params.request.startRow - startRow;
                    const endIndex = params.request.endRow - startRow;

                    this.logger.trace('get cached value', {
                        startRow,
                        endRow,
                        items: recordsDesc.value.length,
                    });
                    return createSyncedValueDescriptor(
                        recordsDesc.value.slice(startIndex, endIndex),
                    );
                }
                return recordsDesc;
            }
        }
    }

    private tryProcessRequestFromCache(
        params: TSSRMRowsParams<RecordType>,
        callbacks: TCallbacks<RecordType>,
    ) {
        const recordsDesc = this.getCachedData(params);

        if (isNil(recordsDesc)) {
            return;
        }

        this.logger.trace('Cached blocks descriptor', {
            state: recordsDesc.state,
            meta: recordsDesc.meta,
            fail: recordsDesc.fail,
        });

        if (isSyncedValueDescriptor(recordsDesc)) {
            callbacks.success(params, recordsDesc.value);
        } else if (isFailValueDescriptor(recordsDesc)) {
            callbacks.fail(params, recordsDesc.fail);
        }
    }

    clear() {
        this.activeParamsManager.clear();

        this.subscriptions.forEach(({ destroy$ }) => destroy$.next());
        this.subscriptions.clear();
        this.cache.clear();

        this.paramsHash = undefined;
        this.filter = undefined;
        this.sort = undefined;
        this.logger.trace('clear');
    }
}

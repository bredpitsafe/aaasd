import type { Nil } from '@common/types';
import type {
    ColumnState,
    ColumnStateParams,
    GridApi,
    IViewportDatasource,
    IViewportDatasourceParams,
} from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isEmpty, isNil } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import type { Observable } from 'rxjs';
import { of, Subject, timer } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';

import { EMPTY_ARRAY, EMPTY_OBJECT } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '../../../utils/React/useValueDescriptorObservable';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isWaitingArgumentsValueDescriptor,
    WAITING_VD,
} from '../../../utils/ValueDescriptor/utils';
import type { TAgTableProps } from '../AgTable';
import { agTableLogger } from '../logger.ts';
import { useGridApiEvent } from './useGridApiEvent';
import { useGridId } from './useGridId.ts';
import { EAgGridOverlay, useGridOverlay } from './useGridOverlay';

export function useAgGridViewportRowModelProps<RecordType>(
    gridApi: GridApi<RecordType> | undefined,
    subscription: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<keyof RecordType, { filterType: string }>;
        sort: {
            field: keyof RecordType;
            sort: Exclude<ColumnStateParams['sort'], Nil>;
        }[];
    }) => Observable<TValueDescriptor2<{ rows: RecordType[]; total: number }>>,
    {
        pageSize = 200,
        bufferSize = 100,
        debounce = 500,
        suppressMultiSort = true,
    }: Partial<{
        pageSize: number;
        bufferSize: number;
        debounce: number;
        suppressMultiSort: boolean;
    }> = {},
): {
    rowModelType: 'viewport';
    viewportDatasource: IViewportDatasource;
} & Partial<
    Pick<
        TAgTableProps<RecordType>,
        | 'viewportRowModelPageSize'
        | 'viewportRowModelBufferSize'
        | 'defaultColDef'
        | 'suppressMultiSort'
    >
> {
    const gridId = useGridId(gridApi);
    const logger = useMemo(
        () => agTableLogger.child([new Binding('VRM'), new Binding(gridId)]),
        [gridId],
    );

    const [filter, setFilter] =
        useState<Record<keyof RecordType, { filterType: string }>>(EMPTY_OBJECT);

    useGridApiEvent(
        gridApi,
        useFunction(({ api }) => {
            const filterModel = api.getFilterModel() as Record<
                keyof RecordType,
                { filterType: string }
            >;
            logger.trace('set filter', filterModel);
            setFilter(filterModel);
        }),
        Events.EVENT_FILTER_CHANGED,
    );

    const [sort, setSort] = useState<
        {
            field: keyof RecordType;
            sort: Exclude<ColumnStateParams['sort'], Nil>;
        }[]
    >(EMPTY_ARRAY);

    useGridApiEvent(
        gridApi,
        useFunction(({ columnApi }) => {
            const sortModel = columnApi
                .getColumnState()
                .filter(({ colId, sort }) => !isEmpty(sort) && !isEmpty(colId))
                .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
                .map(({ colId, sort }: ColumnState) => ({
                    field: colId as keyof RecordType,
                    sort: sort as Exclude<ColumnStateParams['sort'], Nil>,
                }));
            logger.trace('set sort', sortModel);
            setSort(sortModel);
        }),
        Events.EVENT_SORT_CHANGED,
    );

    const [range, setRange] = useState<{ firstRow: number; lastRow: number }>({
        firstRow: 0,
        lastRow: pageSize,
    });

    const setViewportRange = useFunction((firstRow: number, lastRow: number) => {
        const range = {
            firstRow,
            lastRow: lastRow >= firstRow ? Math.ceil(lastRow / pageSize) * pageSize : pageSize,
        };
        logger.trace('set range', range);
        setRange({
            firstRow,
            lastRow: lastRow >= firstRow ? Math.ceil(lastRow / pageSize) * pageSize : pageSize,
        });
    });

    const [viewportDatasourceParams, setViewportDatasourceParams] = useState<
        IViewportDatasourceParams | undefined
    >();

    useEffect(
        // If filter or sorting changes we don't need to keep data
        () => {
            logger.trace('reset row count');
            viewportDatasourceParams?.setRowCount(-1, false);
        },
        [viewportDatasourceParams, filter, sort, logger],
    );

    const destroy$ = useMemo(() => new Subject<void>(), []);

    const rowsDesc$ = useMemo(
        () =>
            isNil(filter) || isNil(sort)
                ? of(WAITING_VD)
                : timer(debounce).pipe(
                      switchMap(() =>
                          subscription({
                              pagination: {
                                  limit: range.lastRow - range.firstRow + 1,
                                  offset: range.firstRow,
                              },
                              filter,
                              sort,
                          }),
                      ),
                      mapValueDescriptor((rowsDesc) => {
                          if (!isSyncedValueDescriptor(rowsDesc)) {
                              return rowsDesc;
                          }

                          return createSyncedValueDescriptor({
                              ...rowsDesc.value,
                              offset: range.firstRow,
                          });
                      }),
                      startWith(WAITING_VD),
                      takeUntil(destroy$),
                  ),
        [filter, sort, destroy$, subscription, range.lastRow, range.firstRow, debounce],
    );

    const rowsDesc = useNotifiedValueDescriptorObservable(rowsDesc$);

    const rowsCount = gridApi?.getDisplayedRowCount() ?? 0;

    useGridOverlay(
        gridApi,
        rowsCount === 0
            ? isLoadingValueDescriptor(rowsDesc) || isWaitingArgumentsValueDescriptor(rowsDesc)
                ? EAgGridOverlay.loading
                : EAgGridOverlay.empty
            : EAgGridOverlay.none,
    );

    useEffect(() => {
        if (isNil(viewportDatasourceParams) || !isSyncedValueDescriptor(rowsDesc)) {
            return;
        }

        const { rows, offset, total } = rowsDesc.value;

        const rowsMap = rows.reduce(
            (acc, row, index) => {
                acc[offset + index] = row;
                return acc;
            },
            {} as Record<number, RecordType>,
        );

        viewportDatasourceParams.setRowCount(total);
        viewportDatasourceParams.setRowData(rowsMap);
        logger.trace('update viewport', { total, rows: rows.length, offset });
    }, [viewportDatasourceParams, rowsDesc, logger]);

    const destroy = useFunction(() => {
        logger.trace('destroy');
        destroy$.next();
    });

    return useMemo(
        () => ({
            rowModelType: 'viewport',
            viewportDatasource: { setViewportRange, init: setViewportDatasourceParams, destroy },
            viewportRowModelPageSize: pageSize,
            viewportRowModelBufferSize: bufferSize,
            defaultColDef: { sortable: false, filter: false },
            suppressMultiSort,
        }),
        [
            destroy,
            setViewportDatasourceParams,
            setViewportRange,
            pageSize,
            bufferSize,
            suppressMultiSort,
        ],
    );
}

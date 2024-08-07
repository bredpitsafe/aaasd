import type { TimeZone } from '@common/types';
import type { TColDef } from '@frontend/ag-grid/src/types.ts';
import { EColumnFilterType } from '@frontend/ag-grid/src/types.ts';
import { backtestingTaskLookupSortableFields } from '@frontend/common/src/actors/BacktestingDataProviders/actions/utils.ts';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor.tsx';
import { isString } from 'lodash-es';
import { useMemo } from 'react';

import { RunsRangeView, RunsStatusView } from '../grid.tsx';
import type { TTableBacktestingTasksItem } from '../view.tsx';

export function useColumns(timeZone: TimeZone): TColDef<TTableBacktestingTasksItem>[] {
    return useMemo<TColDef<TTableBacktestingTasksItem>[]>(
        () =>
            (
                [
                    {
                        field: 'id',
                        headerName: 'ID',
                        sort: 'desc',
                        floatingFilter: true,
                        ...floatingFilter(),
                    },
                    {
                        field: 'name',
                        tooltipField: 'name',
                        ...withReadOnlyEditor(),
                        ...floatingFilter(),
                    },
                    {
                        field: 'description',
                        headerName: 'Description',
                        filter: false,
                        hide: true,
                        suppressAutoSize: true,
                        tooltipField: 'description',
                        ...withReadOnlyEditor(),
                    },
                    {
                        field: 'status',
                    },
                    {
                        field: 'reason',
                        hide: true,
                    },
                    {
                        field: 'totalBtRuns',
                        headerName: 'Total runs',
                    },
                    {
                        colId: 'btRuns',
                        headerName: 'Run range',
                        cellRenderer: RunsRangeView,
                        ...floatingFilter(),
                    },
                    {
                        field: 'user',
                        headerName: 'Author',
                        ...floatingFilter(),
                    },
                    {
                        ...getTimeColumn<TTableBacktestingTasksItem>(
                            (data) => data?.simulationData.startTime,
                            'Start Time',
                            timeZone,
                        ),
                        filter: false,
                    },
                    {
                        ...getTimeColumn<TTableBacktestingTasksItem>(
                            (data) => data?.simulationData.endTime,
                            'End Time',
                            timeZone,
                        ),
                        filter: false,
                    },
                    {
                        field: 'runsStatus',
                        headerName: 'Runs statuses',
                        cellRenderer: RunsStatusView,
                    },
                ] as TColDef<TTableBacktestingTasksItem>[]
            ).map((column): TColDef<TTableBacktestingTasksItem> => {
                column.sortable = isString(column.field)
                    ? backtestingTaskLookupSortableFields.includes(
                          column.field as keyof TTableBacktestingTasksItem,
                      )
                    : false;

                return column;
            }),
        [timeZone],
    );
}

function floatingFilter(): Partial<TColDef<TTableBacktestingTasksItem>> {
    return {
        filter: EColumnFilterType.text,
        floatingFilter: true,
        filterParams: {
            filterOptions: ['contains'],
            maxNumConditions: 0,
            suppressAndOrCondition: true,
        },
    };
}

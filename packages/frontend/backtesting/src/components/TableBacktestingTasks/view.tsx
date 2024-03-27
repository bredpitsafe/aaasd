import type { RowClickedEvent } from '@frontend/ag-grid';
import { ModelUpdatedEvent } from '@frontend/ag-grid';
import { EColumnFilterType, TColDef } from '@frontend/ag-grid/src/types';
import { backtestingTaskLookupSortableFields } from '@frontend/common/src/actors/BacktestingDataProviders/actions/utils.ts';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import {
    TUseInfinityDataSourceProps,
    useInfinityDataSource,
} from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TimeZone } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil, isString } from 'lodash-es';
import { ReactElement, useEffect, useMemo } from 'react';

import { getRowClassRules, RunsRangeView, RunsStatusView } from './grid';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { cnRoot } from './view.css';

export type TTableBacktestingTasksItem = TBacktestingTask;

type TTableBacktestingTasksProps = TWithClassname &
    TUseInfinityDataSourceProps<TTableBacktestingTasksItem> & {
        activeId: undefined | TTableBacktestingTasksItem['id'];
        onChangeActiveId: (id: TTableBacktestingTasksItem['id']) => unknown;
        onStop: (id: TTableBacktestingTasksItem['id']) => unknown;
        onRunAgain: (id: TTableBacktestingTasksItem['id']) => unknown;
        onClone: (id: TTableBacktestingTasksItem['id']) => unknown;
        onDelete: (id: TTableBacktestingTasksItem['id']) => unknown;
        timeZone: TimeZone;
    };

export function TableBacktestingTasks(props: TTableBacktestingTasksProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi();

    const dataSource = useInfinityDataSource(gridApi, props);
    const rowClassRules = useMemo(() => getRowClassRules(), []);
    const getContextMenuItems = useGetContextMenuItems(props);

    const handleClickRow = useFunction((item: RowClickedEvent<TTableBacktestingTasksItem>) => {
        if (!isNil(item.data) && item.data.id !== props.activeId) {
            props.onChangeActiveId(item.data.id);
        }
    });

    const handleSelectActiveNode = useFunction((event: ModelUpdatedEvent<TBacktestingTask>) => {
        const node = event.api.getRowNode(String(props.activeId));
        const selectedNodes = event.api.getSelectedNodes();

        if (!isNil(node) && selectedNodes[0] !== node) {
            node.setSelected(true);
            event.api.ensureNodeVisible(node);
        }
    });

    useEffect(() => {
        if (!isNil(gridApi) && !isNil(props.activeId)) {
            gridApi.getRowNode(String(props.activeId))?.setSelected(true);
        }
    }, [gridApi, props.activeId]);

    const columns = useColumns(props.timeZone);

    return (
        <div className={cn(cnRoot, props.className)}>
            <AgTableWithRouterSync
                id={ETableIds.BacktestingTasks}
                columnDefs={columns}
                rowKey="id"
                rowClassRules={rowClassRules}
                enableBrowserTooltips
                onGridReady={onGridReady}
                onRowClicked={handleClickRow}
                getContextMenuItems={getContextMenuItems}
                onModelUpdated={handleSelectActiveNode}
                {...dataSource}
            />
        </div>
    );
}

function useColumns(timeZone: TimeZone): TColDef<TTableBacktestingTasksItem>[] {
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
                            'Start Time (UTC)',
                            timeZone,
                        ),
                        filter: false,
                    },
                    {
                        ...getTimeColumn<TTableBacktestingTasksItem>(
                            (data) => data?.simulationData.endTime,
                            'End Time (UTC)',
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

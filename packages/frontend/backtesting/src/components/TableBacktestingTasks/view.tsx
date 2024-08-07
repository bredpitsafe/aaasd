import type { TimeZone } from '@common/types';
import { getSelectedRowsWithOrder } from '@frontend/ag-grid/src/utils.ts';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import type { TUseInfinityDataSourceProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { useInfinityDataSource } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import { getRowClassRules } from './grid';
import { useColumns } from './hooks/useColumns.ts';
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
        onBulkDelete?: (ids: TTableBacktestingTasksItem['id'][]) => unknown;
        timeZone: TimeZone;
    };

export function TableBacktestingTasks(props: TTableBacktestingTasksProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi<TTableBacktestingTasksItem>();

    const dataSource = useInfinityDataSource(gridApi, props);
    const rowClassRules = useMemo(() => getRowClassRules(), []);
    const getContextMenuItems = useGetContextMenuItems(props);

    const handleSelectionChanged = useFunction(() => {
        if (isNil(gridApi)) {
            return;
        }

        const items = getSelectedRowsWithOrder(gridApi);

        if (items.length === 0) {
            if (!isNil(props.activeId)) {
                gridApi.getRowNode(String(props.activeId))?.setSelected(true);
            }

            return;
        }

        if (isNil(props.activeId) || items.every(({ id }) => id !== props.activeId)) {
            props.onChangeActiveId(items[0].id);
        }
    });

    const handleSelectActiveNode = useFunction(() => {
        if (isNil(gridApi)) {
            return;
        }

        const selectedNode = gridApi.getRowNode(String(props.activeId));
        const selectedNodes = gridApi.getSelectedNodes();

        if (isNil(selectedNode) || !selectedNodes.includes(selectedNode)) {
            selectedNodes.every((node) => node.setSelected(false));
            selectedNode?.setSelected(true);
            if (!isNil(selectedNode)) {
                gridApi.ensureNodeVisible(selectedNode);
            }
        }
    });

    useEffect(() => handleSelectActiveNode(), [handleSelectActiveNode, gridApi, props.activeId]);

    const columns = useColumns(props.timeZone);

    return (
        <div className={cn(cnRoot, props.className)}>
            <AgTableWithRouterSync
                id={ETableIds.BacktestingTasks}
                rowSelection="multiple"
                columnDefs={columns}
                rowKey="id"
                rowClassRules={rowClassRules}
                enableBrowserTooltips
                onGridReady={onGridReady}
                onSelectionChanged={handleSelectionChanged}
                getContextMenuItems={getContextMenuItems}
                onModelUpdated={handleSelectActiveNode}
                {...dataSource}
            />
        </div>
    );
}

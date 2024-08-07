import type { TimeZone } from '@common/types';
import type { GridOptions, RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { createTestProps } from '@frontend/common/e2e';
import { EActiveTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/active-tasks-tab/active-tasks.tab.selectors';
import { EArchivedTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/archived-tasks-tab/aechived-tasks.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelFiller } from '@frontend/common/src/components/TableLabel/TableLabelFiller';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { EHerodotusVersion } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useGetContextMenuItems } from '../../hooks/useGetContextMenuItems';
import { useTaskInstrumentsTableDetails } from '../../hooks/useTaskInstrumentsTableDetails';
import type { THerodotusTaskInstrumentView, THerodotusTaskView } from '../../types';
import type { THerodotusTaskId } from '../../types/domain';
import { getExportCSVOptions } from '../../utils/getExportCSVOptions';
import {
    cnColorizedDetailsRow,
    cnDisabledRow,
    cnIncreasedRowHeight,
    cnRoot,
} from '../../utils/style.css';
import type { TWidgetTableHerodotusTasksProps } from '../../widgets/WidgetTableHerodotusTasks';
import { DEFAULT_COL_DEF, getColumns } from './columns';

export type TTableHerodotusTasksProps = TWithClassname & {
    tableId: TWidgetTableHerodotusTasksProps['tableId'];
    version?: EHerodotusVersion;
    items: undefined | THerodotusTaskView[];
    socketName: TSocketName;
    onDelete: (taskId: THerodotusTaskId) => void;
    exportFilename?: string;
    timeZone: TimeZone;
    onStart: (taskId: THerodotusTaskId) => Promise<unknown>;
    onPause: (taskId: THerodotusTaskId) => Promise<unknown>;
    onArchive: (taskId: THerodotusTaskId) => Promise<unknown>;
    onClone: (taskId: THerodotusTaskId) => Promise<unknown>;
    onCellEditRequestTask: GridOptions<THerodotusTaskView>['onCellEditRequest'];
    onCellEditRequestInstrument: GridOptions<THerodotusTaskInstrumentView>['onCellEditRequest'];
    onSave: (taskId: THerodotusTaskId) => void;
    onReset: (taskId: THerodotusTaskId) => void;
    onDashboardLinkClick: (url: string, name: string) => void;
};

export function TableHerodotusTasks(props: TTableHerodotusTasksProps): ReactElement {
    const {
        tableId,
        socketName,
        items,
        timeZone,
        onDashboardLinkClick,
        className,
        exportFilename,
        onStart,
        onPause,
        onArchive,
        onCellEditRequestTask,
        onCellEditRequestInstrument,
        onClone,
        onDelete,
        onSave,
        onReset,
    } = props;

    const columns = useMemo(() => {
        return getColumns({
            timeZone,
            onStart,
            onPause,
            tableId,
            onSave,
            onReset,
        });
    }, [timeZone, onStart, onPause, tableId, onSave, onReset]);

    const { gridApi, onGridReady } = useGridApi<THerodotusTaskView>();

    const { getFilteredData } = useFilteredData(gridApi);
    const { onSelectionChanged, selectedRows } = useRowSelection<THerodotusTaskView>();

    const detailsRowsProps = useTaskInstrumentsTableDetails({
        id:
            tableId === ETableIds.ActiveTasks
                ? ETableIds.ActiveTasksNested
                : ETableIds.ArchivedTasksNested,
        type: tableId === ETableIds.ActiveTasks ? 'active' : 'archived',
        onCellEditRequest: onCellEditRequestInstrument,
        socketName,
        onDashboardLinkClick,
    });

    const getContextMenuItems = useGetContextMenuItems({
        socketName,
        onStart,
        onPause,
        onClone,
        onArchive: tableId === ETableIds.ActiveTasks ? onArchive : undefined,
        onDelete: tableId === ETableIds.ArchivedTasks ? onDelete : undefined,
        timeZone,
    });

    const handleGetCSVOptions = useFunction(() => getExportCSVOptions(timeZone));

    const rowClassRules: RowClassRules<THerodotusTaskView> = useMemo(() => {
        return {
            [cnDisabledRow]: ({ data }: RowClassParams<THerodotusTaskView>) =>
                Boolean(data?.updating),
        };
    }, []);

    return (
        <div
            {...createTestProps(
                tableId === ETableIds.ActiveTasks
                    ? EActiveTasksTabSelectors.ActiveTasksTable
                    : EArchivedTasksTabSelectors.ArchivedTasksTable,
            )}
            className={cn(cnRoot, className)}
        >
            <TableLabels>
                <TableLabelFiller />
                <TableLabelCount
                    title={tableId === ETableIds.ActiveTasks ? 'Active Tasks' : 'Archived Tasks'}
                    count={items?.length}
                />
                {exportFilename && items && (
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename={exportFilename}
                        getOptions={handleGetCSVOptions}
                    />
                )}
            </TableLabels>
            <AgTableWithRouterSync<THerodotusTaskView>
                id={tableId}
                rowKey="taskId"
                rowData={items}
                columnDefs={columns}
                defaultColDef={DEFAULT_COL_DEF}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onGridReady={onGridReady}
                rowHeight={40}
                rowClass={cn(cnIncreasedRowHeight, cnColorizedDetailsRow)}
                rowClassRules={rowClassRules}
                getContextMenuItems={getContextMenuItems}
                readOnlyEdit
                onCellEditRequest={onCellEditRequestTask}
                stopEditingWhenCellsLoseFocus
                {...detailsRowsProps}
            />
        </div>
    );
}

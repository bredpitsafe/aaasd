import type { Nil, TimeZone } from '@common/types';
import { createTestProps } from '@frontend/common/e2e';
import { EPositionsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/positions/positions.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import type { TStmPositionRow } from '@frontend/common/src/components/hooks/useStmPositions';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { TableLabelSwitch } from '@frontend/common/src/components/TableLabel/TableLabelSwitch';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TVirtualAccount, TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { TableMultiSelectFilter } from '../filter/TableMultiSelectFilter';
import {
    getIdFromEntity,
    getInstrumentIdFromRow,
    getInstrumentLabel,
    getRobotIdFromRow,
    getRobotLabel,
    getVirtualAccountIdFromRow,
    getVirtualAccountLabel,
} from '../utils/positions.ts';
import {
    cnFullWidth,
    cnInstrumentContainer,
    cnMultiFilterRow,
    cnNonZeroSwitch,
    cnRobotContainer,
    cnRoot,
    cnVirtualAccountContainer,
} from '../view.css';
import { useColumns } from './hooks/useColumn';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TablePositions = memo(
    ({
        tableId,
        robot,
        stmPositionsDesc,
        instruments,
        filterInstrumentIds,
        setFilterInstrumentIds,
        virtualAccounts,
        filterVirtualAccountIds,
        setFilterVirtualAccountIds,
        robots,
        filterRobotIds,
        setFilterRobotIds,
        filterNonZeroPositions,
        setFilterNonZeroPositions,
        timeZone,
    }: {
        tableId: ETableIds;
        robot?: Nil | TRobot;

        stmPositionsDesc: TValueDescriptor2<TStmPositionRow[]>;

        instruments: TInstrument[] | undefined;
        filterInstrumentIds: TInstrumentId[];
        setFilterInstrumentIds: (instrumentIds?: TInstrumentId[]) => void;
        virtualAccounts: TVirtualAccount[] | undefined;
        filterVirtualAccountIds: TVirtualAccountId[];
        setFilterVirtualAccountIds: (virtualAccountIds?: TVirtualAccountId[]) => void;
        robots: TRobot[] | undefined | null;
        filterRobotIds: TRobotId[];
        setFilterRobotIds: (robotIds?: TRobotId[]) => void;
        filterNonZeroPositions: boolean;
        setFilterNonZeroPositions: (newValue?: boolean) => void;

        timeZone: TimeZone;
    }) => {
        const getCSVOptions = useGetCSVOptions(robot, timeZone);

        const { gridApi, onGridReady } = useGridApi<TStmPositionRow>();

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TStmPositionRow>();

        const items = useMemo(
            (): TStmPositionRow[] | undefined =>
                isSyncedValueDescriptor(stmPositionsDesc) ? stmPositionsDesc.value : undefined,
            [stmPositionsDesc],
        );

        const columns = useColumns(robot, timeZone);

        return (
            <div className={cnRoot}>
                <TableLabels className={cnMultiFilterRow}>
                    <TableMultiSelectFilter<TStmPositionRow, TInstrument, TInstrumentId>
                        {...createTestProps(EPositionsTabSelectors.InstrumentsFilter)}
                        className={cnInstrumentContainer}
                        rows={items}
                        selectEntries={instruments}
                        values={filterInstrumentIds}
                        placeHolder="Instruments filter"
                        setValues={setFilterInstrumentIds}
                        getEntityKeyFromRow={getInstrumentIdFromRow}
                        getEntityKey={getIdFromEntity}
                        getEntityValue={getInstrumentLabel}
                    />

                    <TableMultiSelectFilter<TStmPositionRow, TVirtualAccount, TVirtualAccountId>
                        {...createTestProps(EPositionsTabSelectors.VirtualAccountsFilter)}
                        className={cnVirtualAccountContainer}
                        rows={items}
                        selectEntries={virtualAccounts}
                        values={filterVirtualAccountIds}
                        placeHolder="Virtual Accounts filter"
                        setValues={setFilterVirtualAccountIds}
                        getEntityKeyFromRow={getVirtualAccountIdFromRow}
                        getEntityKey={getIdFromEntity}
                        getEntityValue={getVirtualAccountLabel}
                    />

                    {isNil(robot) && (
                        <TableMultiSelectFilter<TStmPositionRow, TRobot, TRobotId>
                            {...createTestProps(EPositionsTabSelectors.RobotFilter)}
                            className={cnRobotContainer}
                            rows={items}
                            selectEntries={robots ?? undefined}
                            values={filterRobotIds}
                            placeHolder="Robots filter"
                            setValues={setFilterRobotIds}
                            getEntityKeyFromRow={getRobotIdFromRow}
                            getEntityKey={getIdFromEntity}
                            getEntityValue={getRobotLabel}
                        />
                    )}
                </TableLabels>
                <TableLabels>
                    <TableLabelSwitch
                        className={cnNonZeroSwitch}
                        title="Non-zero positions only"
                        enabled={filterNonZeroPositions}
                        onToggle={setFilterNonZeroPositions}
                    />
                    <div className={cnFullWidth} />
                    <TableLabelCount
                        title={isNil(robot) ? 'Positions' : 'Robot positions'}
                        count={items?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename={isNil(robot) ? 'positions' : `robot-positions-${robot.id}`}
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    id={tableId}
                    rowKey="rowKey"
                    rowData={items}
                    columnDefs={columns}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={onGridReady}
                    floatingFiltersHeight={30}
                    enableRangeSelection
                    tooltipShowDelay={0}
                    tooltipHideDelay={2000}
                />
            </div>
        );
    },
);

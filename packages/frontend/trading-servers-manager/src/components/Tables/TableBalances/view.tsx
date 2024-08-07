import type { Nil, TimeZone } from '@common/types';
import { createTestProps } from '@frontend/common/e2e';
import { EBalancesTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/balances/balances.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import type { TStmBalanceRow } from '@frontend/common/src/components/hooks/useStmBalances';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { TableLabelSwitch } from '@frontend/common/src/components/TableLabel/TableLabelSwitch';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TVirtualAccount, TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { TableMultiSelectFilter } from '../filter/TableMultiSelectFilter';
import {
    getAssetIdFromRow,
    getAssetLabel,
    getIdFromEntity,
    getInstrumentIdFromRow,
    getInstrumentLabel,
    getRobotIdFromRow,
    getRobotLabel,
    getVirtualAccountIdFromRow,
    getVirtualAccountLabel,
} from '../utils/positions.ts';
import {
    cnAssetContainer,
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
import { useRowClassRules } from './hooks/useRowClassRules';
import { cnBalanceTable } from './view.css.ts';

export const TableBalances = memo(
    ({
        tableId,
        robot,
        stmBalancesDesc,
        instruments,
        filterInstrumentIds,
        setFilterInstrumentIds,
        virtualAccounts,
        filterVirtualAccountIds,
        setFilterVirtualAccountIds,
        robots,
        filterRobotIds,
        setFilterRobotIds,
        assets,
        filterAssetIds,
        setFilterAssetIds,
        filterNonZeroBalances,
        setFilterNonZeroBalances,
        timeZone,
    }: {
        tableId: ETableIds;
        robot?: Nil | TRobot;
        stmBalancesDesc: TValueDescriptor2<TStmBalanceRow[]>;

        instruments: TInstrument[] | undefined;
        filterInstrumentIds: TInstrumentId[];
        setFilterInstrumentIds: (instrumentIds?: TInstrumentId[]) => void;
        virtualAccounts: TVirtualAccount[] | undefined;
        filterVirtualAccountIds: TVirtualAccountId[];
        setFilterVirtualAccountIds: (virtualAccountIds?: TVirtualAccountId[]) => void;
        robots: TRobot[] | undefined | null;
        filterRobotIds: TRobotId[];
        setFilterRobotIds: (robotIds?: TRobotId[]) => void;
        assets: TAsset[] | undefined;
        filterAssetIds: TAssetId[];
        setFilterAssetIds: (assetIds?: TAssetId[]) => void;
        filterNonZeroBalances: boolean;
        setFilterNonZeroBalances: (newValue?: boolean) => void;

        timeZone: TimeZone;
    }) => {
        const getCSVOptions = useGetCSVOptions(robot, timeZone);

        const { gridApi, onGridReady } = useGridApi<TStmBalanceRow>();

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TStmBalanceRow>();

        const items = useMemo(
            (): TStmBalanceRow[] | undefined =>
                isSyncedValueDescriptor(stmBalancesDesc) ? stmBalancesDesc.value : undefined,
            [stmBalancesDesc],
        );

        const columns = useColumns(robot, timeZone);

        const rowClassRules = useRowClassRules();

        return (
            <div className={cnRoot}>
                <TableLabels className={cnMultiFilterRow}>
                    <TableMultiSelectFilter<TStmBalanceRow, TInstrument, TInstrumentId>
                        {...createTestProps(EBalancesTabSelectors.InstrumentsFilter)}
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

                    <TableMultiSelectFilter<TStmBalanceRow, TVirtualAccount, TVirtualAccountId>
                        {...createTestProps(EBalancesTabSelectors.VirtualAccountsFilter)}
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
                        <TableMultiSelectFilter<TStmBalanceRow, TRobot, TRobotId>
                            {...createTestProps(EBalancesTabSelectors.RobotFilter)}
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

                    <TableMultiSelectFilter<TStmBalanceRow, TAsset, TAssetId>
                        {...createTestProps(EBalancesTabSelectors.AssetsFilter)}
                        className={cnAssetContainer}
                        rows={items}
                        selectEntries={assets}
                        values={filterAssetIds}
                        placeHolder="Assets filter"
                        setValues={setFilterAssetIds}
                        getEntityKeyFromRow={getAssetIdFromRow}
                        getEntityKey={getIdFromEntity}
                        getEntityValue={getAssetLabel}
                    />
                </TableLabels>
                <TableLabels>
                    <TableLabelSwitch
                        className={cnNonZeroSwitch}
                        title="Non-zero balances only"
                        enabled={filterNonZeroBalances}
                        onToggle={setFilterNonZeroBalances}
                    />
                    <div className={cnFullWidth} />
                    <TableLabelCount
                        title={isNil(robot) ? 'Balances' : 'Robot Balances'}
                        count={items?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename={isNil(robot) ? 'balances' : `robot-balances-${robot.id}`}
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceTable}
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
                    rowClassRules={rowClassRules}
                />
            </div>
        );
    },
);

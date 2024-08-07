import type { TimeZone } from '@common/types';
import type { IRowNode } from '@frontend/ag-grid';
import {
    ETransfersHistoryTabSelectors,
    TransfersHistoryTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/transfers-history/transfer-history.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type {
    TCoinId,
    TTransferHistoryItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo, useMemo } from 'react';

import type { TTransfersHistoryDescriptor } from '../../../modules/actions/ModuleSubscribeToCurrentTransfersHistory.ts';
import type { TManualTransferFormData } from '../../Forms/ManualTransfer/defs';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { useGridCoinFilter } from '../hooks/useGridCoinFilter';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TableTransfersHistory = memo(
    ({
        coin,
        timeZone,
        historyDescriptor,
        onOpenManualTransferTab,
    }: {
        coin?: TCoinId;
        timeZone: TimeZone;
        historyDescriptor: TTransfersHistoryDescriptor;
        onOpenManualTransferTab: (manualTransfer?: TManualTransferFormData) => void;
    }) => {
        const columns = useColumns(coin, timeZone);
        const getCSVOptions = useGetCSVOptions(timeZone);

        const { gridApi, onGridReady } = useGridApi<TTransferHistoryItem>();

        const {
            regExp,
            filterValid,
            templateExample,
            caseSensitive,
            toggleCaseSensitive,
            setRegExp,
            isExternalFilterPresent: isRegExpFilterPresent,
            doesExternalFilterPass: doesRegExpFilterPass,
        } = useRegExpTableFilter({
            tableId: ETableIds.TransfersHistory,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TTransferHistoryItem>();

        const getContextMenuItems = useGetContextMenuItems(onOpenManualTransferTab);

        const historyItems = useMemo(
            () =>
                matchValueDescriptor(historyDescriptor, {
                    unsynced(vd) {
                        return isFailValueDescriptor(vd)
                            ? (EMPTY_ARRAY as TTransferHistoryItem[])
                            : undefined;
                    },
                    synced({ value }) {
                        return value;
                    },
                }),
            [historyDescriptor],
        );

        const {
            isExternalFilterPresent: isCoinFilterPresent,
            doesExternalFilterPass: doesCoinFilterPass,
        } = useGridCoinFilter<TTransferHistoryItem>(gridApi, coin);

        const isExternalFilterPresent = useFunction(
            () => isCoinFilterPresent() || isRegExpFilterPresent(),
        );

        const doesExternalFilterPass = useFunction(
            (node: IRowNode<TTransferHistoryItem>) =>
                doesRegExpFilterPass(node) && doesCoinFilterPass(node),
        );

        return (
            <div
                {...TransfersHistoryTabProps[ETransfersHistoryTabSelectors.TransfersHistoryTab]}
                className={cnRoot}
            >
                <TableLabels>
                    <TableLabelRegExpFilter
                        inputPlaceholder={templateExample}
                        inputValue={regExp}
                        inputValid={filterValid}
                        onInputChange={setRegExp}
                        caseSensitive={caseSensitive}
                        onCaseSensitiveToggle={toggleCaseSensitive}
                    />
                    <TableLabelCount
                        title="History Transfers"
                        count={historyItems?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="suggestions"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.TransfersHistory}
                    rowKey="name"
                    rowData={historyItems}
                    columnDefs={columns}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={onGridReady}
                    isExternalFilterPresent={isExternalFilterPresent}
                    doesExternalFilterPass={doesExternalFilterPass}
                    getContextMenuItems={getContextMenuItems}
                    floatingFiltersHeight={30}
                    enableRangeSelection
                    stopEditingWhenCellsLoseFocus
                    tooltipShowDelay={0}
                    tooltipHideDelay={2000}
                    rowHeight={DEFAULT_ROW_HEIGHT}
                />
            </div>
        );
    },
);

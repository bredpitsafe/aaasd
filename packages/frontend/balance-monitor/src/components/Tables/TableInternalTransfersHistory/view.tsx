import type { TimeZone } from '@common/types';
import {
    EInternalTransfersHistoryTabSelectors,
    InternalTransfersHistoryTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers-history/internal-transfers-history.tab.selectors';
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
import type { TInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo, useMemo } from 'react';

import type { TInternalTransferHistoryDescriptor } from '../../../modules/actions/ModuleSubscribeToInternalTransferHistoryOnCurrentStage.ts';
import type { TInternalTransferFormProps } from '../../Forms/InternalTransfers/defs';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TableInternalTransfersHistory = memo(
    ({
        timeZone,
        historyDescriptor,
        onOpenInternalTransferTab,
    }: {
        timeZone: TimeZone;
        historyDescriptor: TInternalTransferHistoryDescriptor;
        onOpenInternalTransferTab: (manualTransfer?: TInternalTransferFormProps) => void;
    }) => {
        const columns = useColumns(timeZone);
        const getCSVOptions = useGetCSVOptions(timeZone);

        const { gridApi, onGridReady } = useGridApi<TInternalTransfer>();

        const {
            regExp,
            filterValid,
            templateExample,
            caseSensitive,
            toggleCaseSensitive,
            setRegExp,
            isExternalFilterPresent,
            doesExternalFilterPass,
        } = useRegExpTableFilter({
            tableId: ETableIds.InternalTransfersHistory,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TInternalTransfer>();

        const historyItems = useMemo(
            () =>
                matchValueDescriptor(historyDescriptor, {
                    unsynced(vd) {
                        return isFailValueDescriptor(vd)
                            ? (EMPTY_ARRAY as TInternalTransfer[])
                            : undefined;
                    },
                    synced({ value }) {
                        return value;
                    },
                }),
            [historyDescriptor],
        );

        const getContextMenuItems = useGetContextMenuItems(onOpenInternalTransferTab);

        return (
            <div
                {...InternalTransfersHistoryTabProps[
                    EInternalTransfersHistoryTabSelectors.InternalTransfersHistoryTab
                ]}
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
                        title="Internal History Transfers"
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
                    id={ETableIds.InternalTransfersHistory}
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
                    tooltipShowDelay={0}
                    tooltipHideDelay={2000}
                    rowHeight={DEFAULT_ROW_HEIGHT}
                />
            </div>
        );
    },
);

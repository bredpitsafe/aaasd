import type { TimeZone } from '@common/types';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import {
    ETransferBlockingRulesTabProps,
    ETransferBlockingRulesTabSelector,
} from '@frontend/common/e2e/selectors/balance-monitor/components/transfer-blocking-rules/transfer-blocking-rules.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import {
    EAgGridOverlay,
    useGridOverlay,
} from '@frontend/common/src/components/AgTable/hooks/useGridOverlay';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { useTransactionArrayUpdate } from '@frontend/common/src/components/AgTable/hooks/useTransactionUpdate';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isWaitingArgumentsValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TTransfersBlockingRulesDescriptor } from '../../../modules/actions/ModuleSubscribeToCurrentTransferRules.ts';
import { isEqualsComplexRuleValues } from '../../utils';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';
import { cnActiveAlertRules } from './view.css.ts';

export const TableTransferBlockingRules = memo(
    ({
        timeZone,
        transferBlockingRulesDescriptor,
        onDeleteTransferBlockingRule,
        onEditTransferBlockingRule,
    }: {
        timeZone: TimeZone;
        transferBlockingRulesDescriptor: TTransfersBlockingRulesDescriptor;
        onDeleteTransferBlockingRule: (transferBlockingRule: TTransferBlockingRuleInfo) => void;
        onEditTransferBlockingRule: (transferBlockingRule: TTransferBlockingRuleInfo) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TTransferBlockingRuleInfo>();

        const columns = useColumns(timeZone);
        const getCSVOptions = useGetCSVOptions(timeZone);

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TTransferBlockingRuleInfo>();

        const transferBlockingRules = useMemo(
            () =>
                isSyncedValueDescriptor(transferBlockingRulesDescriptor)
                    ? transferBlockingRulesDescriptor.value
                    : undefined,
            [transferBlockingRulesDescriptor],
        );

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
            tableId: ETableIds.TransferBlockingRules,
            columns,
            gridApi,
        });

        useTransactionArrayUpdate<TTransferBlockingRuleInfo, 'id'>(
            gridApi,
            'id',
            transferBlockingRules,
            isEqualsTransferBlockingRules,
        );

        useGridOverlay(
            gridApi,
            isLoadingValueDescriptor(transferBlockingRulesDescriptor) ||
                isWaitingArgumentsValueDescriptor(transferBlockingRulesDescriptor)
                ? EAgGridOverlay.loading
                : isEmpty(transferBlockingRulesDescriptor.value)
                  ? EAgGridOverlay.empty
                  : EAgGridOverlay.none,
        );

        const getContextMenuItems = useGetContextMenuItems(
            onDeleteTransferBlockingRule,
            onEditTransferBlockingRule,
        );

        return (
            <div
                {...ETransferBlockingRulesTabProps[
                    ETransferBlockingRulesTabSelector.TransferBlockingRulesTab
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
                        title="Transfer Blocking Rules"
                        count={transferBlockingRules?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="transferBlockingRules"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.TransferBlockingRules}
                    rowKey="id"
                    columnDefs={columns}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={onGridReady}
                    isExternalFilterPresent={isExternalFilterPresent}
                    doesExternalFilterPass={doesExternalFilterPass}
                    groupDisplayType="groupRows"
                    rowHeight={DEFAULT_ROW_HEIGHT}
                    floatingFiltersHeight={30}
                    getContextMenuItems={getContextMenuItems}
                    rowClassRules={ROW_CLASS_RULES}
                />
            </div>
        );
    },
);

const ROW_CLASS_RULES: RowClassRules<TTransferBlockingRuleInfo> = {
    [cnActiveAlertRules]: ({ node: { data } }: RowClassParams<TTransferBlockingRuleInfo>) =>
        !isNil(data) && data.showAlert && data.actualStatus === ERuleActualStatus.Active,
};

function isEqualsTransferBlockingRules(
    a: TTransferBlockingRuleInfo,
    b: TTransferBlockingRuleInfo,
): boolean {
    return (
        isEqualsComplexRuleValues(a.coinsMatchRule, b.coinsMatchRule) &&
        isEqualsComplexRuleValues(a.source.exchangesMatchRule, b.source.exchangesMatchRule) &&
        isEqualsComplexRuleValues(a.source.accountsMatchRule, b.source.accountsMatchRule) &&
        isEqualsComplexRuleValues(
            a.destination.exchangesMatchRule,
            b.destination.exchangesMatchRule,
        ) &&
        isEqualsComplexRuleValues(
            a.destination.accountsMatchRule,
            b.destination.accountsMatchRule,
        ) &&
        a.disabledGroups === b.disabledGroups &&
        a.withOpposite === b.withOpposite &&
        a.showAlert === b.showAlert &&
        a.since === b.since &&
        a.until === b.until &&
        a.note === b.note &&
        a.username === b.username &&
        a.actualStatus === b.actualStatus &&
        a.createTime === b.createTime &&
        a.updateTime === b.updateTime
    );
}

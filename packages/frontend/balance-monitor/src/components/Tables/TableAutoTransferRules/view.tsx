import type { TimeZone } from '@common/types';
import {
    EAutoTransferRulesTabProps,
    EAutoTransferRulesTabSelector,
} from '@frontend/common/e2e/selectors/balance-monitor/components/auto-transfer-rules/auto-transfer-rules.tab.selectors';
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
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isWaitingArgumentsValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TAutoTransferRulesDescriptor } from '../../../modules/actions/ModuleSubscribeToAutoTransferRulesOnCurrentStage.ts';
import { isEqualsComplexRuleValues } from '../../utils';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TableAutoTransferRules = memo(
    ({
        timeZone,
        autoTransferRulesDescriptor,
        onDeleteAutoTransferRule,
        onEditAutoTransferRule,
    }: {
        timeZone: TimeZone;
        autoTransferRulesDescriptor: TAutoTransferRulesDescriptor;
        onDeleteAutoTransferRule: (transferBlockingRule: TAutoTransferRuleInfo) => void;
        onEditAutoTransferRule: (transferBlockingRule: TAutoTransferRuleInfo) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TAutoTransferRuleInfo>();

        const columns = useColumns(timeZone);
        const getCSVOptions = useGetCSVOptions(timeZone);

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TAutoTransferRuleInfo>();

        const autoTransferRules = useMemo(
            () =>
                isSyncedValueDescriptor(autoTransferRulesDescriptor)
                    ? autoTransferRulesDescriptor.value
                    : undefined,
            [autoTransferRulesDescriptor],
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
            tableId: ETableIds.AutoTransferRules,
            columns,
            gridApi,
        });

        useTransactionArrayUpdate<TAutoTransferRuleInfo, 'id'>(
            gridApi,
            'id',
            autoTransferRules,
            isEqualsAutoTransferRules,
        );

        useGridOverlay(
            gridApi,
            isLoadingValueDescriptor(autoTransferRulesDescriptor) ||
                isWaitingArgumentsValueDescriptor(autoTransferRulesDescriptor)
                ? EAgGridOverlay.loading
                : isEmpty(autoTransferRulesDescriptor.value)
                  ? EAgGridOverlay.empty
                  : EAgGridOverlay.none,
        );

        const getContextMenuItems = useGetContextMenuItems(
            onDeleteAutoTransferRule,
            onEditAutoTransferRule,
        );

        return (
            <div
                {...EAutoTransferRulesTabProps[EAutoTransferRulesTabSelector.AutoTransferRulesTab]}
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
                        title="Auto Transfer Rules"
                        count={autoTransferRules?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="autoTransferRules"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.AutoTransferRules}
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
                />
            </div>
        );
    },
);

function isEqualsAutoTransferRules(a: TAutoTransferRuleInfo, b: TAutoTransferRuleInfo): boolean {
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
        a.withOpposite === b.withOpposite &&
        a.note === b.note &&
        a.username === b.username &&
        a.createTime === b.createTime &&
        a.updateTime === b.updateTime &&
        a.enableAuto === b.enableAuto &&
        a.rulePriority === b.rulePriority
    );
}

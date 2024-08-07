import type { TimeZone } from '@common/types';
import {
    EAmountLimitsRulesTabProps,
    EAmountLimitsRulesTabSelector,
} from '@frontend/common/e2e/selectors/balance-monitor/components/amount-limits-rules/amount-limits-rules.tab.selectors';
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
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isWaitingArgumentsValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TConvertRatesDescriptor } from '../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TAmountLimitsRulesDescriptor } from '../../../modules/actions/ModuleSubscribeToCurrentLimitingTransferRules.ts';
import { isEqualsComplexRuleValues } from '../../utils';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { ConvertRatesContext } from './components/ConvertRatesContext';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';

export const TableAmountLimitsRules = memo(
    ({
        timeZone,
        amountLimitsRulesDescriptor,
        convertRatesDescriptor,
        onDeleteAmountLimitsRule,
        onEditAmountLimitsRule,
    }: {
        timeZone: TimeZone;
        amountLimitsRulesDescriptor: TAmountLimitsRulesDescriptor;
        convertRatesDescriptor: TConvertRatesDescriptor;
        onDeleteAmountLimitsRule: (transferBlockingRule: TAmountLimitsRuleInfo) => void;
        onEditAmountLimitsRule: (transferBlockingRule: TAmountLimitsRuleInfo) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TAmountLimitsRuleInfo>();

        const columns = useColumns(timeZone);
        const getCSVOptions = useGetCSVOptions(timeZone);

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TAmountLimitsRuleInfo>();

        const amountLimitsRules = useMemo(
            () =>
                isSyncedValueDescriptor(amountLimitsRulesDescriptor)
                    ? amountLimitsRulesDescriptor.value
                    : undefined,
            [amountLimitsRulesDescriptor],
        );

        const convertRates = useMemo(
            () =>
                isSyncedValueDescriptor(convertRatesDescriptor)
                    ? convertRatesDescriptor.value
                    : undefined,
            [convertRatesDescriptor],
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
            tableId: ETableIds.AmountLimitsRules,
            columns,
            gridApi,
        });

        useTransactionArrayUpdate<TAmountLimitsRuleInfo, 'id'>(
            gridApi,
            'id',
            amountLimitsRules,
            isEqualsAmountLimitsRules,
        );

        useGridOverlay(
            gridApi,
            isLoadingValueDescriptor(amountLimitsRulesDescriptor) ||
                isWaitingArgumentsValueDescriptor(amountLimitsRulesDescriptor)
                ? EAgGridOverlay.loading
                : isEmpty(amountLimitsRulesDescriptor.value)
                  ? EAgGridOverlay.empty
                  : EAgGridOverlay.none,
        );

        const getContextMenuItems = useGetContextMenuItems(
            onDeleteAmountLimitsRule,
            onEditAmountLimitsRule,
        );

        return (
            <div
                {...EAmountLimitsRulesTabProps[EAmountLimitsRulesTabSelector.AmountLimitsRulesTab]}
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
                        title="Amount Limits Rules"
                        count={amountLimitsRules?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="amountLimitsRules"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <ConvertRatesContext.Provider value={convertRates}>
                    <AgTableWithRouterSync
                        className={cnBalanceMonitorTable}
                        id={ETableIds.AmountLimitsRules}
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
                </ConvertRatesContext.Provider>
            </div>
        );
    },
);

function isEqualsAmountLimitsRules(a: TAmountLimitsRuleInfo, b: TAmountLimitsRuleInfo): boolean {
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
        a.amountMin === b.amountMin &&
        a.amountMax === b.amountMax &&
        a.amountCurrency === b.amountCurrency &&
        a.rulePriority === b.rulePriority &&
        a.doNotOverride === b.doNotOverride
    );
}

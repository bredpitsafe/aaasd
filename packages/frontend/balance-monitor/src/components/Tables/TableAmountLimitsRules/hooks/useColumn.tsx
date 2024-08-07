import type { TimeZone } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { BOOLEAN_FILTER_VALUES } from '@frontend/ag-grid/src/filters';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import { CheckboxCellRenderer } from '@frontend/common/src/components/CheckboxCellRenderer/index';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';

import { AccountSelectorViewCellRenderer } from '../../components/AccountSelectorViewCellRenderer';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { CoinSelectorViewCellRenderer } from '../../components/CoinSelectorViewCellRenderer';
import { ExchangeSelectorViewCellRenderer } from '../../components/ExchangeSelectorViewCellRenderer';
import { AccountSelectorViewRendererTooltip } from '../../components/Rules/AccountSelectorViewRendererTooltip';
import { CoinSelectorViewRendererTooltip } from '../../components/Rules/CoinSelectorViewRendererTooltip';
import { ExchangeSelectorViewRendererTooltip } from '../../components/Rules/ExchangeSelectorViewRendererTooltip';
import { cnCenterCellContent } from '../../style.css';
import {
    createRowIndexColumn,
    FLOATING_DATE_FILTER,
    FLOATING_SET_FILTER,
    FLOATING_TEXT_FILTER,
    formatSingleValueOrArray,
    getIsoDateFilterParams,
} from '../../utils';
import {
    AmountLimitCellRenderer,
    createAmountLimitCellValueGetter,
} from '../components/AmountLimitCellRenderer';

export function useColumns(timeZone: TimeZone): ColDef<TAmountLimitsRuleInfo>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),
            {
                field: 'id',
                headerName: 'ID',
                ...FLOATING_TEXT_FILTER,
            },

            {
                ...getTimeColumn<TAmountLimitsRuleInfo>('createTime', 'Created', timeZone),
                sort: 'desc',
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TAmountLimitsRuleInfo>('updateTime', 'Updated', timeZone),
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                field: 'username',
                headerName: 'User Name',
                ...FLOATING_TEXT_FILTER,
            },

            {
                field: 'coinsMatchRule',
                headerName: 'Coin',
                cellRenderer: CoinSelectorViewCellRenderer,
                tooltipField: 'coinsMatchRule',
                tooltipComponent: CoinSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TAmountLimitsRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'source.exchangesMatchRule',
                headerName: 'Source Exchange',
                cellRenderer: ExchangeSelectorViewCellRenderer,
                tooltipField: 'source.exchangesMatchRule',
                tooltipComponent: ExchangeSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TAmountLimitsRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'source.accountsMatchRule',
                headerName: 'Source Account',
                cellRenderer: AccountSelectorViewCellRenderer,
                tooltipField: 'source.accountsMatchRule',
                tooltipComponent: AccountSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TAmountLimitsRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'destination.exchangesMatchRule',
                headerName: 'Destination Exchange',
                cellRenderer: ExchangeSelectorViewCellRenderer,
                tooltipField: 'destination.exchangesMatchRule',
                tooltipComponent: ExchangeSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TAmountLimitsRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'destination.accountsMatchRule',
                headerName: 'Destination Account',
                cellRenderer: AccountSelectorViewCellRenderer,
                tooltipField: 'destination.accountsMatchRule',
                tooltipComponent: AccountSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TAmountLimitsRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'withOpposite',
                headerName: 'Both directions',
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                filterParams: {
                    ...BOOLEAN_FILTER_VALUES,
                },
                ...FLOATING_SET_FILTER,
            },

            {
                colId: 'amountMin',
                headerName: 'Amount Min',
                equals: AgValue.isEqual,
                valueGetter: createAmountLimitCellValueGetter('amountMin'),
                cellRenderer: AmountLimitCellRenderer,
                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'amountMax',
                headerName: 'Amount Max',
                equals: AgValue.isEqual,
                valueGetter: createAmountLimitCellValueGetter('amountMax'),
                cellRenderer: AmountLimitCellRenderer,
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'amountCurrency',
                headerName: 'Amount currency',
                cellRenderer: CoinCellRenderer,
                ...FLOATING_SET_FILTER,
            },

            {
                field: 'rulePriority',
                headerName: 'Rule priority',
                initialHide: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'doNotOverride',
                headerName: 'Do not override',
                initialHide: true,
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                ...FLOATING_SET_FILTER,
            },

            {
                field: 'note',
                headerName: 'Note',
                tooltipField: 'note',
                tooltipComponent: DefaultTooltip,
                ...FLOATING_TEXT_FILTER,
            },
        ],
        [timeZone],
    );
}

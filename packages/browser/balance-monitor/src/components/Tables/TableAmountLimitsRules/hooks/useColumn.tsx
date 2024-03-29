import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import { useMemo } from 'react';

import { AccountSelectorViewCellRenderer } from '../../components/AccountSelectorViewCellRenderer';
import { CheckboxCellRenderer } from '../../components/CheckboxCellRenderer';
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
import { AmountLimitCellRenderer } from '../components/AmountLimitCellRenderer';

export function useColumns(timeZone: TimeZone): TColDef<TAmountLimitsRuleInfo>[] {
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
                ...FLOATING_SET_FILTER,
            },

            {
                field: 'amountMin',
                headerName: 'Amount Min',
                equals: () => false,
                cellRenderer: AmountLimitCellRenderer,
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'amountMax',
                headerName: 'Amount Max',
                equals: () => false,
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

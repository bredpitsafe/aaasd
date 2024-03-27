import type { TColDef } from '@frontend/ag-grid/src/types';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import { useMemo } from 'react';

import { AccountSelectorViewCellRenderer } from '../../components/AccountSelectorViewCellRenderer';
import { CheckboxCellRenderer } from '../../components/CheckboxCellRenderer';
import { CoinSelectorViewCellRenderer } from '../../components/CoinSelectorViewCellRenderer';
import { DisabledGroupsSelectorViewCellRenderer } from '../../components/DisabledGroupsSelectorViewCellRenderer';
import { ExchangeSelectorViewCellRenderer } from '../../components/ExchangeSelectorViewCellRenderer';
import { AccountSelectorViewRendererTooltip } from '../../components/Rules/AccountSelectorViewRendererTooltip';
import { CoinSelectorViewRendererTooltip } from '../../components/Rules/CoinSelectorViewRendererTooltip';
import { ExchangeSelectorViewRendererTooltip } from '../../components/Rules/ExchangeSelectorViewRendererTooltip';
import { TransferBlockingRuleStatusRenderer } from '../../components/TransferBlockingRuleStatusRenderer';
import { cnCenterCellContent } from '../../style.css';
import {
    createRowIndexColumn,
    FLOATING_DATE_FILTER,
    FLOATING_SET_FILTER,
    FLOATING_TEXT_FILTER,
    formatSingleValueOrArray,
    getIsoDateFilterParams,
} from '../../utils';

export function useColumns(timeZone: TimeZone): TColDef<TTransferBlockingRuleInfo>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),
            {
                field: 'id',
                headerName: 'ID',
                ...FLOATING_TEXT_FILTER,
            },
            {
                ...getTimeColumn<TTransferBlockingRuleInfo>('createTime', 'Created', timeZone),
                sort: 'desc',
                sortIndex: 1,
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TTransferBlockingRuleInfo>('updateTime', 'Updated', timeZone),
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
                field: 'actualStatus',
                headerName: 'Status',
                cellRenderer: TransferBlockingRuleStatusRenderer,
                cellClass: () => cnCenterCellContent,
                comparator: (a: ERuleActualStatus, b: ERuleActualStatus) =>
                    getStatusScore(a) - getStatusScore(b),
                sort: 'asc',
                sortIndex: 0,
                ...FLOATING_SET_FILTER,
            },

            {
                field: 'coinsMatchRule',
                headerName: 'Coin',
                cellRenderer: CoinSelectorViewCellRenderer,
                tooltipField: 'coinsMatchRule',
                tooltipComponent: CoinSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TTransferBlockingRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'source.exchangesMatchRule',
                headerName: 'Source Exchange',
                cellRenderer: ExchangeSelectorViewCellRenderer,
                tooltipField: 'source.exchangesMatchRule',
                tooltipComponent: ExchangeSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TTransferBlockingRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'source.accountsMatchRule',
                headerName: 'Source Account',
                cellRenderer: AccountSelectorViewCellRenderer,
                tooltipField: 'source.accountsMatchRule',
                tooltipComponent: AccountSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TTransferBlockingRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'destination.exchangesMatchRule',
                headerName: 'Destination Exchange',
                cellRenderer: ExchangeSelectorViewCellRenderer,
                tooltipField: 'destination.exchangesMatchRule',
                tooltipComponent: ExchangeSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TTransferBlockingRuleInfo>,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'destination.accountsMatchRule',
                headerName: 'Destination Account',
                cellRenderer: AccountSelectorViewCellRenderer,
                tooltipField: 'destination.accountsMatchRule',
                tooltipComponent: AccountSelectorViewRendererTooltip,
                valueFormatter: formatSingleValueOrArray<TTransferBlockingRuleInfo>,
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
                field: 'showAlert',
                headerName: 'Show Alert',
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'disabledGroups',
                headerName: 'Disabled',
                cellRenderer: DisabledGroupsSelectorViewCellRenderer,
                ...FLOATING_SET_FILTER,
            },

            {
                ...getTimeColumn<TTransferBlockingRuleInfo>('since', 'Since', timeZone),
                sort: 'desc',
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TTransferBlockingRuleInfo>('until', 'Until', timeZone),
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
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

function getStatusScore(status: ERuleActualStatus): number {
    switch (status) {
        case ERuleActualStatus.Active:
            return 1;
        case ERuleActualStatus.Waiting:
            return 2;
        case ERuleActualStatus.Expired:
            return 3;
        default:
            return 4;
    }
}

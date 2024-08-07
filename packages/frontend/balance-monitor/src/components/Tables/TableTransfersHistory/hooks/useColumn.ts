import type { TimeZone } from '@common/types';
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import {
    type TAmount,
    type TCoinId,
    type TTransferHistoryItem,
    EInProgressSolutionStatus,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EBalanceMonitorLayoutComponents } from '../../../../layouts/defs';
import {
    AccountCellRenderer,
    createAccountCellValueGetter,
} from '../../components/accountCellRenderer';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { TransactionStatusRenderer } from '../../components/TransactionStatusRenderer';
import { cnActionCellClass } from '../../TableSuggestions/view.css';
import {
    createRowIndexColumn,
    FLOATING_DATE_FILTER,
    FLOATING_SET_FILTER,
    FLOATING_TEXT_FILTER,
    formatAmountOrEmptyWithoutGroups,
    getFloatingStatusFilter,
    getIsoDateFilterParams,
} from '../../utils';
import { ExplorersLinkRenderer } from '../components/ExplorersLinkRenderer';
import { TRANSFER_HISTORY_AMOUNT_DIGITS } from '../defs';
import { getCreateModeDisplayText } from './utils';

export function useColumns(
    coin: TCoinId | undefined,
    timeZone: TimeZone,
): ColDef<TTransferHistoryItem>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),
            {
                ...getTimeColumn<TTransferHistoryItem>('createTime', 'Created', timeZone),
                sort: 'desc',
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TTransferHistoryItem>('updateTime', 'Updated', timeZone),
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                field: 'clientId',
                headerName: 'Client ID',
                initialHide: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'name',
                headerName: 'Name',
                initialHide: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'state',
                headerName: 'Status',
                cellRenderer: TransactionStatusRenderer,
                cellClass: () => cnActionCellClass,
                ...getFloatingStatusFilter([
                    EInProgressSolutionStatus.Sent,
                    EInProgressSolutionStatus.Starting,
                    EInProgressSolutionStatus.Succeeded,
                    EInProgressSolutionStatus.Rejected,
                    EInProgressSolutionStatus.Launched,
                    EInProgressSolutionStatus.Planned,
                    EInProgressSolutionStatus.Pending,
                    EInProgressSolutionStatus.Received,
                    EInProgressSolutionStatus.Created,
                    EInProgressSolutionStatus.Cancelled,
                    EInProgressSolutionStatus.Failed,
                    EInProgressSolutionStatus.Invalid,
                    EInProgressSolutionStatus.CreateError,
                    EInProgressSolutionStatus.ConfirmedBalance,
                    EInProgressSolutionStatus.ConfirmedChain,
                ]),
            },
            {
                field: 'coin',
                headerName: 'Coin',
                cellRenderer: CoinCellRenderer,
                cellRendererParams: { tab: EBalanceMonitorLayoutComponents.TransfersHistory },
                enableFilter: isNil(coin),
                filter: !isNil(coin),
                ...(isNil(coin) ? FLOATING_SET_FILTER : undefined),
            },
            {
                colId: 'source',
                headerName: 'Source',
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter<TTransferHistoryItem>(({ source }) => ({
                    account: source.account,
                    exchange: source.exchange,
                })),
                cellRenderer: AccountCellRenderer,
                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'destination',
                headerName: 'Destination',
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter<TTransferHistoryItem>(
                    ({ destination }) => ({
                        account: destination.account,
                        exchange: destination.exchange,
                    }),
                ),
                cellRenderer: AccountCellRenderer,
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'createMode',
                headerName: 'Creation Mode',
                valueGetter: (params: ValueGetterParams<TTransferHistoryItem>) =>
                    isNil(params.data) ? '' : getCreateModeDisplayText(params.data.createMode),
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'amount',
                headerName: 'Amount',
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value, TRANSFER_HISTORY_AMOUNT_DIGITS),
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'network',
                headerName: 'Network',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'txid',
                headerName: 'Tx ID',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'txExplorers',
                headerName: 'Explorers',
                cellRenderer: ExplorersLinkRenderer,
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, string[]>) =>
                    value?.join(', ') ?? '',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'stateMsg',
                headerName: 'State Message',
                tooltipField: 'stateMsg',
                tooltipComponent: DefaultTooltip,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'stateMsgRaw',
                headerName: 'State Message Raw',
                tooltipField: 'stateMsgRaw',
                tooltipComponent: DefaultTooltip,
                ...FLOATING_TEXT_FILTER,
            },

            {
                field: 'amountUSD',
                headerName: 'Amount USD',
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value),
                initialHide: true,
            },
            {
                field: 'srcFee',
                headerName: 'Src Fee',
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value),
                initialHide: true,
            },
            {
                field: 'srcFeeUSD',
                headerName: 'Src Fee USD',
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value),
                initialHide: true,
            },
            {
                field: 'balancePercent',
                headerName: 'Balance %',
                valueFormatter: ({ value }: ValueFormatterParams<TTransferHistoryItem, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value),
                initialHide: true,
            },
            {
                field: 'reserveField1',
                headerName: 'Reserve Field 1',
                initialHide: true,
            },
            {
                field: 'reserveField2',
                headerName: 'Reserve Field 2',
                initialHide: true,
            },
        ],
        [coin, timeZone],
    );
}

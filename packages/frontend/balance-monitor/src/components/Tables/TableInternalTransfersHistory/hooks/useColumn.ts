import type { TimeZone } from '@common/types';
import type { ValueFormatterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import {
    type TAmount,
    type TInternalTransfer,
    EInProgressSolutionStatus,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';

import {
    AccountCellRenderer,
    createAccountCellValueGetter,
} from '../../components/accountCellRenderer';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import {
    createSubAccountCellValueGetter,
    SubAccountCellRenderer,
} from '../../components/subAccountCellRenderer';
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
import { INTERNAL_TRANSFER_HISTORY_AMOUNT_DIGITS } from '../defs';

export function useColumns(timeZone: TimeZone): TColDef<TInternalTransfer>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),
            {
                ...getTimeColumn<TInternalTransfer>('createTime', 'Created', timeZone),
                sort: 'desc',
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TInternalTransfer>('updateTime', 'Updated', timeZone),
                initialHide: true,
                minWidth: 170,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },
            {
                ...getTimeColumn<TInternalTransfer>('startTime', 'Started', timeZone),
                initialHide: true,
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
                field: 'username',
                headerName: 'Username',
                initialHide: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'state',
                headerName: 'Status',
                minWidth: 100,
                cellRenderer: TransactionStatusRenderer,
                cellClass: () => cnActionCellClass,
                ...getFloatingStatusFilter([
                    EInProgressSolutionStatus.Created,
                    EInProgressSolutionStatus.Succeeded,
                    EInProgressSolutionStatus.Sent,
                    EInProgressSolutionStatus.Starting,
                    EInProgressSolutionStatus.Launched,
                    EInProgressSolutionStatus.Planned,
                    EInProgressSolutionStatus.Pending,
                    EInProgressSolutionStatus.Received,
                    EInProgressSolutionStatus.Rejected,
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
                minWidth: 100,

                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'mainAccount',
                headerName: 'Main Account',
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter<TInternalTransfer>(({ mainAccount }) => ({
                    account: mainAccount.account,
                    exchange: mainAccount.exchange,
                })),
                cellRenderer: AccountCellRenderer,

                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'source',
                headerName: 'Source',
                equals: AgValue.isEqual,
                valueGetter: createSubAccountCellValueGetter<TInternalTransfer>(({ source }) => ({
                    account: source.name,
                    section: source.section,
                })),
                cellRenderer: SubAccountCellRenderer,

                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'destination',
                headerName: 'Destination',
                equals: AgValue.isEqual,
                valueGetter: createSubAccountCellValueGetter<TInternalTransfer>(
                    ({ destination }) => ({
                        account: destination.name,
                        section: destination.section,
                    }),
                ),
                cellRenderer: SubAccountCellRenderer,

                ...FLOATING_SET_FILTER,
            },
            {
                field: 'amount',
                headerName: 'Amount',
                valueFormatter: ({ value }: ValueFormatterParams<TInternalTransfer, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(
                        value,
                        INTERNAL_TRANSFER_HISTORY_AMOUNT_DIGITS,
                    ),
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'transferID',
                headerName: 'Transfer ID',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'stateMsg',
                headerName: 'State Message',
                tooltipField: 'stateMsg',
                tooltipComponent: DefaultTooltip,
                ...FLOATING_TEXT_FILTER,
            },
        ],
        [timeZone],
    );
}

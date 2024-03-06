import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import type {
    TAmount,
    TInternalTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import type { ValueFormatterParams } from 'ag-grid-community/dist/lib/entities/colDef';
import { useMemo } from 'react';

import { accountCellRendererFactory } from '../../components/accountCellRendererFactory';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { subAccountCellRendererFactory } from '../../components/subAccountCellRendererFactory';
import { TransactionStatusRenderer } from '../../components/TransactionStatusRenderer';
import { cnActionCellClass } from '../../TableSuggestions/view.css';
import {
    createRowIndexColumn,
    FLOATING_DATE_FILTER,
    FLOATING_SET_FILTER,
    FLOATING_TEXT_FILTER,
    formatAmountOrEmptyWithoutGroups,
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
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'coin',
                headerName: 'Coin',
                cellRenderer: CoinCellRenderer,
                minWidth: 100,
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'mainAccount.account',
                headerName: 'Main Account',
                equals: () => false,
                cellRenderer: accountCellRendererFactory<
                    TInternalTransfer,
                    'mainAccount',
                    'exchange'
                >('mainAccount', 'exchange'),
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'source.name',
                headerName: 'Source',
                equals: () => false,
                cellRenderer: subAccountCellRendererFactory<TInternalTransfer, 'source', 'section'>(
                    'source',
                    'section',
                ),
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'destination.name',
                headerName: 'Destination',
                equals: () => false,
                cellRenderer: subAccountCellRendererFactory<
                    TInternalTransfer,
                    'destination',
                    'section'
                >('destination', 'section'),
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

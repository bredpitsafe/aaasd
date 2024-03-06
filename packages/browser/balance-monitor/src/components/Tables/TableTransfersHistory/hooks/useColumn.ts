import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import type {
    TAmount,
    TCoinId,
    TTransferHistoryItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import type { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EBalanceMonitorLayoutComponents } from '../../../../layouts/defs';
import { accountCellRendererFactory } from '../../components/accountCellRendererFactory';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
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
import { ExplorersLinkRenderer } from '../components/ExplorersLinkRenderer';
import { TRANSFER_HISTORY_AMOUNT_DIGITS } from '../defs';
import { getCreateModeDisplayText } from './utils';

export function useColumns(
    coin: TCoinId | undefined,
    timeZone: TimeZone,
): TColDef<TTransferHistoryItem>[] {
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
                ...FLOATING_SET_FILTER,
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
                field: 'source.account',
                headerName: 'Source',
                equals: () => false,
                cellRenderer: accountCellRendererFactory<
                    TTransferHistoryItem,
                    'source',
                    'exchange'
                >('source', 'exchange'),
                ...FLOATING_SET_FILTER,
            },
            {
                headerName: 'Destination',
                field: 'destination.account',
                equals: () => false,
                cellRenderer: accountCellRendererFactory<
                    TTransferHistoryItem,
                    'destination',
                    'exchange'
                >('destination', 'exchange'),
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
        ],
        [coin, timeZone],
    );
}

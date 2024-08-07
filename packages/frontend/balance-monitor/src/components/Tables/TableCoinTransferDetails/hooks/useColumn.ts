import type { KeyByType } from '@common/types';
import type { ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { BOOLEAN_FILTER_VALUES } from '@frontend/ag-grid/src/filters';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { CheckboxCellRenderer } from '@frontend/common/src/components/CheckboxCellRenderer/index';
import type { TAmount } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EBalanceMonitorLayoutComponents } from '../../../../layouts/defs';
import { CONVERSION_DIGITS } from '../../../defs';
import { formatAmountOrEmpty, formatAmountOrEmptyWithConversionRate } from '../../../utils';
import {
    AccountCellRenderer,
    createAccountCellValueGetter,
} from '../../components/accountCellRenderer';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { cnCenterCellContent } from '../../style.css';
import { createRowIndexColumn, FLOATING_SET_FILTER, FLOATING_TEXT_FILTER } from '../../utils';
import type { TCoinTransferDetailsWithId } from '../defs';
import { TRANSFER_DETAILS_AMOUNT_DIGITS } from '../defs';

export function useColumns(): TColDef<TCoinTransferDetailsWithId>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),
            {
                field: 'rowId',
                hide: true,
                sort: 'asc',
            },
            {
                field: 'coin',
                headerName: 'Coin',
                cellRenderer: CoinCellRenderer,
                cellRendererParams: { tab: EBalanceMonitorLayoutComponents.CoinTransferDetails },

                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'source',
                headerName: 'Source',
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter(({ source }) => ({
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
                valueGetter: createAccountCellValueGetter(({ destination }) => ({
                    account: destination.account,
                    exchange: destination.exchange,
                })),
                cellRenderer: AccountCellRenderer,

                ...FLOATING_SET_FILTER,
            },
            {
                field: 'network',
                headerName: 'Network',

                ...FLOATING_SET_FILTER,
            },
            {
                field: 'exchangeMin',
                headerName: 'Exchange Min',
                valueGetter: usdAmountValueGetter,
                valueFormatter: amountValueFormatter,
            },
            {
                field: 'exchangeMax',
                headerName: 'Exchange Max',
                valueGetter: usdAmountValueGetter,
                valueFormatter: amountValueFormatter,
            },
            {
                field: 'accountMin',
                headerName: 'Account Min',
                valueGetter: usdAmountValueGetter,
                valueFormatter: amountValueFormatter,
            },
            {
                field: 'accountMax',
                headerName: 'Account Max',
                valueGetter: usdAmountValueGetter,
                valueFormatter: amountValueFormatter,
            },
            {
                field: 'isManualEnabled',
                headerName: 'Manual Enabled',
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                filterParams: {
                    ...BOOLEAN_FILTER_VALUES,
                },
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'isSuggestEnabled',
                headerName: 'Suggest Enabled',
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                filterParams: {
                    ...BOOLEAN_FILTER_VALUES,
                },
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'isAutoEnabled',
                headerName: 'Auto Enabled',
                cellRenderer: CheckboxCellRenderer,
                cellClass: () => cnCenterCellContent,
                filterParams: {
                    ...BOOLEAN_FILTER_VALUES,
                },
                ...FLOATING_SET_FILTER,
            },
            {
                field: 'priority',
                headerName: 'Priority',
                initialHide: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'reasons',
                headerName: 'Reasons',
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<
                    TCoinTransferDetailsWithId,
                    TCoinTransferDetailsWithId['reasons']
                >) => value?.join('; ') ?? '',
                ...FLOATING_TEXT_FILTER,
            },
        ],
        [],
    );
}

function usdAmountValueGetter(params: ValueGetterParams<TCoinTransferDetailsWithId>): TAmount {
    if (isNil(params.data) || isNil(params.data.convertRate) || isNil(params.colDef.field)) {
        return 0 as TAmount;
    }

    const {
        colDef: { field },
        data: {
            convertRate: { rate },
        },
    } = params;

    const amount = params.data[field as KeyByType<TCoinTransferDetailsWithId, TAmount>];

    return (amount * rate) as TAmount;
}

function amountValueFormatter(
    params: ValueFormatterParams<TCoinTransferDetailsWithId, TAmount>,
): string {
    if (isNil(params.data) || isNil(params.colDef.field)) {
        return formatAmountOrEmpty(undefined);
    }

    const {
        colDef: { field },
        data: { convertRate },
    } = params;

    const amount = params.data[field as KeyByType<TCoinTransferDetailsWithId, TAmount>];

    return formatAmountOrEmptyWithConversionRate(
        amount,
        convertRate,
        TRANSFER_DETAILS_AMOUNT_DIGITS,
        CONVERSION_DIGITS,
    );
}

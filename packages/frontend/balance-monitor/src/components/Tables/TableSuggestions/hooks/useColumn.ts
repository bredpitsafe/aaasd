import type { KeyByType } from '@common/types';
import type {
    CellClassParams,
    EditableCallbackParams,
    ValueFormatterParams,
    ValueGetterParams,
    ValueSetterParams,
} from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import type { TColDef } from '@frontend/ag-grid/src/types';
import type {
    TAccountInfo,
    TAmount,
    TBalanceMonitorAccountId,
    TExchangeId,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { clamp, isNil, sortBy, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { EBalanceMonitorLayoutComponents } from '../../../../layouts/defs';
import { CONVERSION_DIGITS, PERCENTAGE_DIGITS } from '../../../defs';
import {
    formatAmountOrEmpty,
    formatAmountOrEmptyWithConversionRate,
    formattedPercentOrEmpty,
    getPercentageValue,
    getPercentOrEmpty,
    getQuoteAmount,
    roundAmount,
} from '../../../utils';
import {
    AccountCellRenderer,
    createAccountCellValueGetter,
} from '../../components/accountCellRenderer';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { TransactionStatusRenderer } from '../../components/TransactionStatusRenderer';
import { FLOATING_SET_FILTER } from '../../utils';
import { AccountRenderer } from '../components/AccountRenderer';
import { AmountRenderer, amountValueGetter } from '../components/AmountRenderer';
import { MakeTransferRenderer, makeTransferValueGetter } from '../components/MakeTransferRenderer';
import { ResetCellRenderer, resetCellValueGetter } from '../components/ResetCellRenderer';
import type { TPlainSuggestion } from '../defs';
import { EAmountNotification, EPlainSuggestionGroup, SUGGEST_AMOUNT_DIGITS } from '../defs';
import { cnActionCellClass } from '../view.css';

const ACTION_COLUMN_PROPS: Partial<TColDef<TPlainSuggestion>> = {
    headerName: '',
    filter: false,
    resizable: false,
    sortable: false,
    cellClass: () => cnActionCellClass,
};

export function useColumns(
    coin: TCoinId | undefined,
    markRowEdited: (key: string) => void,
): TColDef<TPlainSuggestion>[] {
    return useMemo(
        () => [
            {
                field: 'group',
                rowGroup: true,
                filter: false,
                sortable: false,
                rowGroupIndex: 1,
                hide: true,
                maxWidth: 150,
            },
            {
                field: 'status',
                enableCellChangeFlash: true,
                headerName: 'Status',
                cellRenderer: TransactionStatusRenderer,
                cellClass: () => cnActionCellClass,
            },
            {
                colId: 'reset',
                maxWidth: 32,
                equals: AgValue.isEqual,
                valueGetter: resetCellValueGetter,
                cellRenderer: ResetCellRenderer,
                ...ACTION_COLUMN_PROPS,
            },
            {
                field: 'coin',
                sort: 'asc',
                headerName: 'Coin',
                cellRenderer: CoinCellRenderer,
                cellRendererParams: { tab: EBalanceMonitorLayoutComponents.SuggestedTransfers },
                enableFilter: isNil(coin),
                filter: !isNil(coin),
                ...(isNil(coin) ? FLOATING_SET_FILTER : undefined),
            },
            {
                colId: 'source',
                enableCellChangeFlash: true,
                headerName: 'Source',
                cellEditorPopup: true,
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter(({ source, sourceExchange }) => ({
                    account: source,
                    exchange: sourceExchange,
                })),
                cellRenderer: AccountCellRenderer,
                editable: isEditableAccountFactory('destination', 'from'),
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: popupAccountsOptionsFactory(
                    'source',
                    'destination',
                    'from',
                    'to',
                ),
                valueSetter: accountInfoValueSetterFactory(
                    'destination',
                    'from',
                    'to',
                    'source',
                    'sourceExchange',
                    'destination',
                    'destinationExchange',
                    markRowEdited,
                ),
                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'destination',
                enableCellChangeFlash: true,
                headerName: 'Destination',
                cellEditorPopup: true,
                equals: AgValue.isEqual,
                valueGetter: createAccountCellValueGetter(
                    ({ destination, destinationExchange }) => ({
                        account: destination,
                        exchange: destinationExchange,
                    }),
                ),
                cellRenderer: AccountCellRenderer,
                editable: isEditableAccountFactory('source', 'to'),
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: popupAccountsOptionsFactory(
                    'destination',
                    'source',
                    'to',
                    'from',
                ),
                valueSetter: accountInfoValueSetterFactory(
                    'source',
                    'to',
                    'from',
                    'destination',
                    'destinationExchange',
                    'source',
                    'sourceExchange',
                    markRowEdited,
                ),
                ...FLOATING_SET_FILTER,
            },
            {
                colId: 'available',
                enableCellChangeFlash: true,
                headerName: 'Available',
                valueGetter: usdAccountBalanceValueGetter,
                valueFormatter: availableValueFormatter,
                comparator: amountComparator,
            },
            {
                colId: 'min-amount',
                headerName: 'Min Amount',
                valueGetter: limitValueGetterFactory('minSuggestTransfer'),
                valueFormatter: limitValueFormatterFactory('minSuggestTransfer'),
                initialHide: true,
            },
            {
                colId: 'max-amount',
                headerName: 'Max Amount',
                valueGetter: limitValueGetterFactory('maxSuggestTransfer'),
                valueFormatter: limitValueFormatterFactory('maxSuggestTransfer'),
                initialHide: true,
            },
            {
                colId: 'transfer-amount',
                headerName: 'Transfer Amount',
                enableCellChangeFlash: true,
                cellStyle: { fontWeight: '600' },
                valueGetter: amountValueGetter,
                valueFormatter: amountValueFormatter,
                cellRenderer: AmountRenderer,
                comparator: amountComparator,
                editable: isAmountEditable,
                valueSetter: amountCellValueSetterFactory(markRowEdited),
                cellEditorParams: transferAmountCellEditorParams,
            },
            {
                colId: 'percentage',
                headerName: 'Account / Exchange',
                enableCellChangeFlash: true,
                valueGetter: accountPercentValueGetter,
                valueFormatter: percentValueFormatter,
                editable: isPercentEditable,
                valueSetter: accountPercentCellValueSetterFactory(markRowEdited),
            },
            {
                colId: 'markup',
                headerName: 'Markup',
                enableCellChangeFlash: true,
                valueGetter: markupValueGetter,
                valueFormatter: markupValueFormatter,
            },
            {
                colId: 'make-transfer',
                maxWidth: 60,
                equals: AgValue.isEqual,
                valueGetter: makeTransferValueGetter,
                cellRenderer: MakeTransferRenderer,
                ...ACTION_COLUMN_PROPS,
            },
        ],
        [coin, markRowEdited],
    );
}

function percentValueFormatter(params: ValueFormatterParams<TPlainSuggestion>): string {
    if (isNil(params.data)) {
        return formattedPercentOrEmpty(undefined);
    }

    const { group, sourceExchange, source, initialBalances, amount, exchangeStats, accounts } =
        params.data;

    if (group !== EPlainSuggestionGroup.New) {
        return formattedPercentOrEmpty(undefined);
    }

    // TODO: Remove hardcoded account names when backend will send us separate key for this purpose.
    // @see https://krwteam.slack.com/archives/C05D5CCCYEN/p1694184124380509
    const hideExchangeBalancePercent =
        ['HB_', 'BB_', 'MM_'].includes(source.slice(0, 3)) ||
        accounts?.filter(({ exchange }) => exchange === sourceExchange).length === 1;

    const accountBalance = initialBalances?.[source];
    const exchangeBalance = exchangeStats?.[sourceExchange]?.currentBalance;

    if (isNil(accountBalance) && isNil(exchangeBalance)) {
        return formattedPercentOrEmpty(undefined);
    }

    const amountPercent = formattedPercentOrEmpty(
        getPercentOrEmpty(amount, accountBalance),
        PERCENTAGE_DIGITS,
    );

    if (hideExchangeBalancePercent) {
        return amountPercent;
    }

    return `${amountPercent} / ${formattedPercentOrEmpty(
        getPercentOrEmpty(amount, exchangeBalance),
        PERCENTAGE_DIGITS,
    )}`;
}

function availableValueFormatter(params: ValueFormatterParams<TPlainSuggestion>): string {
    if (isNil(params.data)) {
        return formatAmountOrEmpty(undefined);
    }

    const { source, initialBalances, convertRate } = params.data;

    return formatAmountOrEmptyWithConversionRate(
        initialBalances?.[source],
        convertRate,
        SUGGEST_AMOUNT_DIGITS,
        CONVERSION_DIGITS,
    );
}

function usdAccountBalanceValueGetter(params: ValueGetterParams<TPlainSuggestion>): TAmount {
    if (isNil(params.data)) {
        return 0 as TAmount;
    }

    const { source, initialBalances, convertRate } = params.data;

    if (isNil(initialBalances) || isNil(initialBalances[source]) || isNil(convertRate)) {
        return 0 as TAmount;
    }

    return getQuoteAmount(initialBalances[source], convertRate, CONVERSION_DIGITS);
}

function amountValueFormatter(params: ValueFormatterParams<TPlainSuggestion>): string {
    if (isNil(params.data)) {
        return formatAmountOrEmpty(undefined);
    }

    const { amount, convertRate } = params.data;

    return formatAmountOrEmptyWithConversionRate(
        amount,
        convertRate,
        SUGGEST_AMOUNT_DIGITS,
        CONVERSION_DIGITS,
    );
}

function transferAmountCellEditorParams(params: CellClassParams<TPlainSuggestion>) {
    return {
        value: params.data?.amount ?? 0,
    };
}

function accountPercentValueGetter(params: ValueGetterParams<TPlainSuggestion>): string {
    if (isNil(params.data)) {
        return '';
    }

    const { group, source, initialBalances, amount } = params.data;

    if (group !== EPlainSuggestionGroup.New) {
        return '';
    }

    const accountBalance = initialBalances?.[source];

    if (isNil(accountBalance) || accountBalance === 0) {
        return '';
    }

    return (
        getPercentOrEmpty(amount, accountBalance, PERCENTAGE_DIGITS)?.toFixed(PERCENTAGE_DIGITS) ??
        ''
    );
}

function amountComparator(valueA: TAmount, valueB: TAmount): number {
    return valueA - valueB;
}

function isEditable(params: EditableCallbackParams<TPlainSuggestion>): boolean {
    return !isNil(params.data) && params.data.group === EPlainSuggestionGroup.New;
}

function isAmountEditable(params: EditableCallbackParams<TPlainSuggestion>): boolean {
    return isEditable(params) && !isNil(getCurrentTransfer(params));
}

function isPercentEditable(params: EditableCallbackParams<TPlainSuggestion>): boolean {
    if (isNil(params.data)) {
        return false;
    }

    const { source, initialBalances } = params.data;

    return isAmountEditable(params) && !isNil(initialBalances) && !isNil(initialBalances[source]);
}

function setAmountWithNotification(
    params: ValueSetterParams<TPlainSuggestion>,
    amount: TAmount,
    transfer: TTransfer,
) {
    params.data.amountNotification =
        amount < transfer.minSuggestTransfer || amount > transfer.maxSuggestTransfer
            ? EAmountNotification.OutOfRange
            : EAmountNotification.None;
    params.data.amount = amount;
}

function accountPercentCellValueSetterFactory(markRowEdited: (key: string) => void) {
    return (params: ValueSetterParams<TPlainSuggestion>) => {
        if (params.oldValue === params.newValue) {
            return false;
        }

        const { source, initialBalances } = params.data;

        const transfer = getCurrentTransfer(params);

        if (isNil(initialBalances) || isNil(initialBalances[source]) || isNil(transfer)) {
            return false;
        }

        const newAccountPercent = parseFloat(params.newValue);

        if (Number.isNaN(newAccountPercent) || !isFinite(newAccountPercent)) {
            return false;
        }

        const amount = roundAmount(
            getPercentageValue(
                initialBalances[source],
                clamp(newAccountPercent, 0, 100),
                SUGGEST_AMOUNT_DIGITS,
            ) as TAmount,
            SUGGEST_AMOUNT_DIGITS,
        );

        setAmountWithNotification(params, amount, transfer);

        markRowEdited(params.data.key);

        return true;
    };
}

function amountCellValueSetterFactory(markRowEdited: (key: string) => void) {
    return (params: ValueSetterParams<TPlainSuggestion>) => {
        const transfer = getCurrentTransfer(params);

        if (isNil(transfer)) {
            return false;
        }

        const oldValue = params.data.amount;
        const newValue = roundAmount(
            params.newValue >= 0
                ? (params.newValue as TAmount)
                : transfer.suggestedTransfer ?? (0 as TAmount),
            SUGGEST_AMOUNT_DIGITS,
        );

        if (oldValue === newValue) {
            return false;
        }

        setAmountWithNotification(params, newValue, transfer);

        markRowEdited(params.data.key);

        return true;
    };
}

function isEditableAccountFactory(
    filterField: KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    accountTransferFilterField: KeyByType<TTransfer, TAccountInfo>,
) {
    return function (params: EditableCallbackParams<TPlainSuggestion>): boolean {
        if (isNil(params.data) || !isEditable(params) || isNil(params.data.possibleTransfers)) {
            return false;
        }

        return (
            new Set(
                params.data.possibleTransfers.map(
                    ({ [accountTransferFilterField]: { account } }) => account,
                ),
            ).size > 1
        );
    };
}

function popupAccountsOptionsFactory<
    TFieldKey extends KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    TOppositeFieldKey extends KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    TTransferField extends KeyByType<TTransfer, TAccountInfo>,
    TOppositeTransferField extends KeyByType<TTransfer, TAccountInfo>,
>(
    transferField: TFieldKey,
    oppositeTransferField: TOppositeFieldKey,
    accountTransferField: TTransferField,
    accountTransferOtherField: TOppositeTransferField,
) {
    return function (params: CellClassParams<TPlainSuggestion>) {
        if (isNil(params.data) || isNil(params.data.possibleTransfers)) {
            return false;
        }

        const {
            possibleTransfers,
            [oppositeTransferField]: oppositeAccount,
            [transferField]: currentAccount,
        } = params.data;

        const validAccounts = new Set(
            possibleTransfers
                .filter(
                    ({ [accountTransferOtherField]: filterAccount }) =>
                        filterAccount.account === oppositeAccount,
                )
                .map(({ [accountTransferField]: { account } }) => account),
        );

        return {
            values: sortBy(
                uniqBy(
                    params.data.possibleTransfers.map(
                        ({ [accountTransferField]: accountInfo }) => ({
                            ...accountInfo,
                            hasDirectTransfer: validAccounts.has(accountInfo.account),
                            selected: accountInfo.account === currentAccount,
                        }),
                    ),
                    ({ account }) => account,
                ),
                ({ account }) => account,
            ),
            cellRenderer: AccountRenderer,
            cellHeight: 30,
        };
    };
}

function accountInfoValueSetterFactory<
    TFieldKey extends KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    TTransferField extends KeyByType<TTransfer, TAccountInfo>,
    TOppositeTransferField extends KeyByType<TTransfer, TAccountInfo>,
    TAccountName extends KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    TAccountExchange extends KeyByType<TPlainSuggestion, TExchangeId>,
    TOppositeAccountName extends KeyByType<TPlainSuggestion, TBalanceMonitorAccountId>,
    TOppositeAccountExchange extends KeyByType<TPlainSuggestion, TExchangeId>,
>(
    oppositeTransferField: TFieldKey,
    accountTransferField: TTransferField,
    accountTransferOtherField: TOppositeTransferField,
    accountNameField: TAccountName,
    accountExchangeField: TAccountExchange,
    oppositeAccountNameField: TOppositeAccountName,
    oppositeAccountExchangeField: TOppositeAccountExchange,
    markRowEdited: (key: string) => void,
): (params: ValueSetterParams<TPlainSuggestion>) => boolean {
    return (params: ValueSetterParams<TPlainSuggestion>) => {
        if (
            params.oldValue.exchange === params.newValue.exchange &&
            params.oldValue.account === params.newValue.account
        ) {
            return false;
        }

        const accountInfo = params.newValue as TAccountInfo;

        params.data[accountNameField] = accountInfo.account;
        params.data[accountExchangeField] = accountInfo.exchange;

        const { possibleTransfers, [oppositeTransferField]: oppositeAccount } = params.data;

        if (
            !isNil(possibleTransfers) &&
            possibleTransfers.every(
                ({
                    [accountTransferField]: currentAccountInfo,
                    [accountTransferOtherField]: oppositeAccountInfo,
                }) =>
                    currentAccountInfo.account !== accountInfo.account ||
                    oppositeAccountInfo.account !== oppositeAccount,
            )
        ) {
            const firstValid = possibleTransfers.find(
                ({ [accountTransferField]: currentAccountInfo }) =>
                    currentAccountInfo.account === accountInfo.account,
            );

            if (!isNil(firstValid)) {
                const accountInfo = firstValid[accountTransferOtherField];
                params.data[oppositeAccountNameField] = accountInfo.account;
                params.data[oppositeAccountExchangeField] = accountInfo.exchange;
            }
        }

        const transfer = getCurrentTransfer(params);

        if (!isNil(transfer)) {
            if (transfer.minSuggestTransfer > transfer.maxSuggestTransfer) {
                params.data.amountNotification = EAmountNotification.MinGreaterThanMax;
                params.data.amount = 0 as TAmount;
            } else {
                params.data.amountNotification = EAmountNotification.None;
                params.data.amount = clamp(
                    params.data.amount,
                    transfer.minSuggestTransfer,
                    transfer.maxSuggestTransfer,
                ) as TAmount;
            }
        }

        markRowEdited(params.data.key);

        return true;
    };
}

function getCurrentTransfer(
    params:
        | ValueGetterParams<TPlainSuggestion>
        | ValueSetterParams<TPlainSuggestion>
        | EditableCallbackParams<TPlainSuggestion>
        | ValueFormatterParams<TPlainSuggestion, TAmount | undefined>,
) {
    if (isNil(params.data)) {
        return undefined;
    }

    const { source, destination, possibleTransfers } = params.data;

    if (isNil(possibleTransfers)) {
        return undefined;
    }

    return possibleTransfers.find(
        ({ from, to }) => from.account === source && to.account === destination,
    );
}

function limitValueFormatterFactory(key: KeyByType<TTransfer, TAmount>) {
    return (params: ValueFormatterParams<TPlainSuggestion, TAmount | undefined>) => {
        if (isNil(params.data)) {
            return formatAmountOrEmpty(undefined);
        }

        const { convertRate } = params.data;

        if (isNil(convertRate)) {
            return formatAmountOrEmpty(undefined);
        }

        const transfer = getCurrentTransfer(params);

        if (isNil(transfer) || isNil(transfer[key])) {
            return formatAmountOrEmpty(undefined);
        }

        return formatAmountOrEmptyWithConversionRate(
            transfer[key],
            convertRate,
            SUGGEST_AMOUNT_DIGITS,
            CONVERSION_DIGITS,
        );
    };
}

function limitValueGetterFactory(key: KeyByType<TTransfer, TAmount>) {
    return (params: ValueGetterParams<TPlainSuggestion>): TAmount => {
        if (isNil(params.data)) {
            return 0 as TAmount;
        }

        const { convertRate } = params.data;

        if (isNil(convertRate)) {
            return 0 as TAmount;
        }

        const transfer = getCurrentTransfer(params);

        if (isNil(transfer) || isNil(transfer[key])) {
            return 0 as TAmount;
        }

        return getQuoteAmount(transfer[key], convertRate, CONVERSION_DIGITS);
    };
}

function markupValueGetter(params: ValueGetterParams<TPlainSuggestion>): TAmount | undefined {
    if (isNil(params.data) || isNil(params.data.exchangeStats)) {
        return undefined;
    }

    const { destinationExchange, exchangeStats } = params.data;

    return exchangeStats[destinationExchange]?.markup;
}

function markupValueFormatter({
    value,
    data,
}: ValueFormatterParams<TPlainSuggestion, TAmount | undefined>): string {
    if (isNil(value) || isNil(data) || data.group !== EPlainSuggestionGroup.New) {
        return '';
    }

    return formatAmountOrEmpty(value);
}

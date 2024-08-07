import { createTestProps } from '../../../../index';

export enum EInternalTransfersTabSelectors {
    InternalTransfersTab = 'internalTransfersTab',
    AccountSelector = 'accountSelector',
    FromToSelector = 'fromToSelector',
    FromToSectionSelector = 'fromToSectionSelector',
    CoinSelector = 'coinSelector',
    AvailableInput = 'availableInput',
    AmountInput = 'amountInput',
    PercentInput = 'percentInput',
    BalancesSwitch = 'balancesSwitch',
    ClearButton = 'clearButton',
    SendButton = 'sendButton',
}

export const InternalTransfersTabTabProps = {
    [EInternalTransfersTabSelectors.InternalTransfersTab]: createTestProps(
        EInternalTransfersTabSelectors.InternalTransfersTab,
    ),
    [EInternalTransfersTabSelectors.FromToSelector]: createTestProps(
        EInternalTransfersTabSelectors.FromToSelector,
    ),
    [EInternalTransfersTabSelectors.AccountSelector]: createTestProps(
        EInternalTransfersTabSelectors.AccountSelector,
    ),
    [EInternalTransfersTabSelectors.FromToSectionSelector]: createTestProps(
        EInternalTransfersTabSelectors.FromToSectionSelector,
    ),
    [EInternalTransfersTabSelectors.CoinSelector]: createTestProps(
        EInternalTransfersTabSelectors.CoinSelector,
    ),
    [EInternalTransfersTabSelectors.AvailableInput]: createTestProps(
        EInternalTransfersTabSelectors.AvailableInput,
    ),
    [EInternalTransfersTabSelectors.AmountInput]: createTestProps(
        EInternalTransfersTabSelectors.AmountInput,
    ),
    [EInternalTransfersTabSelectors.PercentInput]: createTestProps(
        EInternalTransfersTabSelectors.PercentInput,
    ),
    [EInternalTransfersTabSelectors.BalancesSwitch]: createTestProps(
        EInternalTransfersTabSelectors.BalancesSwitch,
    ),
    [EInternalTransfersTabSelectors.ClearButton]: createTestProps(
        EInternalTransfersTabSelectors.ClearButton,
    ),
    [EInternalTransfersTabSelectors.SendButton]: createTestProps(
        EInternalTransfersTabSelectors.SendButton,
    ),
};

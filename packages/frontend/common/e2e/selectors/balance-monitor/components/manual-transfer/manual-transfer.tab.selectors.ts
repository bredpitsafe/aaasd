import { createTestProps } from '../../../../index';

export enum EManualTransferTabSelectors {
    ManualTransferTab = 'manualTransferTab',
    CoinSelector = 'coinInput',
    SourceSelector = 'sourceSelector',
    DestinationSelector = 'destinationSelector',
    AvailableSelector = 'availableSelector',
    AmountInput = 'amountInput',
    PercentInput = 'percentInput',
    ClearButton = 'clearButton',
    SendButton = 'sendButton',
    WarningIconButton = '[data-test="sendButton"] [aria-label="warning"]',
}

export const ManualTransferTabProps = {
    [EManualTransferTabSelectors.ManualTransferTab]: createTestProps(
        EManualTransferTabSelectors.ManualTransferTab,
    ),
    [EManualTransferTabSelectors.CoinSelector]: createTestProps(
        EManualTransferTabSelectors.CoinSelector,
    ),
    [EManualTransferTabSelectors.SourceSelector]: createTestProps(
        EManualTransferTabSelectors.SourceSelector,
    ),
    [EManualTransferTabSelectors.DestinationSelector]: createTestProps(
        EManualTransferTabSelectors.DestinationSelector,
    ),
    [EManualTransferTabSelectors.AvailableSelector]: createTestProps(
        EManualTransferTabSelectors.AvailableSelector,
    ),
    [EManualTransferTabSelectors.AmountInput]: createTestProps(
        EManualTransferTabSelectors.AmountInput,
    ),
    [EManualTransferTabSelectors.PercentInput]: createTestProps(
        EManualTransferTabSelectors.PercentInput,
    ),
    [EManualTransferTabSelectors.ClearButton]: createTestProps(
        EManualTransferTabSelectors.ClearButton,
    ),
    [EManualTransferTabSelectors.SendButton]: createTestProps(
        EManualTransferTabSelectors.SendButton,
    ),
};

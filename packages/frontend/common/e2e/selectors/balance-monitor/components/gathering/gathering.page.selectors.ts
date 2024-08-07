import { createTestProps } from '../../../../index';

export enum EGatheringTabSelectors {
    GatheringTab = 'gatheringTab',
    ExchangeSelector = 'exchangeSelector',
    CoinSelector = 'coinSelector',
    AvailableInput = 'availableInput',
    AmountInput = 'amountInput',
    PercentInput = 'percentInput',
    ClearButton = 'clearButton',
    StopCollectingButton = 'stopCollectingButton',
    CollectButton = 'collectButton',
}

export const GatheringTabProps = {
    [EGatheringTabSelectors.GatheringTab]: createTestProps(EGatheringTabSelectors.GatheringTab),
    [EGatheringTabSelectors.ExchangeSelector]: createTestProps(
        EGatheringTabSelectors.ExchangeSelector,
    ),
    [EGatheringTabSelectors.CoinSelector]: createTestProps(EGatheringTabSelectors.CoinSelector),
    [EGatheringTabSelectors.AvailableInput]: createTestProps(EGatheringTabSelectors.AvailableInput),
    [EGatheringTabSelectors.AmountInput]: createTestProps(EGatheringTabSelectors.AmountInput),
    [EGatheringTabSelectors.PercentInput]: createTestProps(EGatheringTabSelectors.PercentInput),
    [EGatheringTabSelectors.ClearButton]: createTestProps(EGatheringTabSelectors.ClearButton),
    [EGatheringTabSelectors.StopCollectingButton]: createTestProps(
        EGatheringTabSelectors.StopCollectingButton,
    ),
    [EGatheringTabSelectors.CollectButton]: createTestProps(EGatheringTabSelectors.CollectButton),
};

import { createTestProps } from '../../index';

export enum EBalanceMonitorSelectors {
    App = 'appBalanceMonitor',
    BalanceMonitorButton = 'balanceMonitorButton',
    InternalTransfersButton = 'internalTransfersButton',
    TransferBlockingRulesButton = 'transferBlockingRulesButton',
    AmountLimitsRulesButton = 'amountLimitsRulesButton',
    AutoTransferRules = 'autoTransferRules',
    ComponentStatusesButton = 'componentStatusesButton',
    CoinFilterSelector = 'coinFilterSelector',
    PumpAndDumpButton = 'pumpAndDumpButton',
}

export const BalanceMonitorProps = {
    [EBalanceMonitorSelectors.App]: createTestProps(EBalanceMonitorSelectors.App),
    [EBalanceMonitorSelectors.BalanceMonitorButton]: createTestProps(
        EBalanceMonitorSelectors.BalanceMonitorButton,
    ),
    [EBalanceMonitorSelectors.InternalTransfersButton]: createTestProps(
        EBalanceMonitorSelectors.InternalTransfersButton,
    ),
    [EBalanceMonitorSelectors.TransferBlockingRulesButton]: createTestProps(
        EBalanceMonitorSelectors.TransferBlockingRulesButton,
    ),
    [EBalanceMonitorSelectors.AmountLimitsRulesButton]: createTestProps(
        EBalanceMonitorSelectors.AmountLimitsRulesButton,
    ),
    [EBalanceMonitorSelectors.AutoTransferRules]: createTestProps(
        EBalanceMonitorSelectors.AutoTransferRules,
    ),
    [EBalanceMonitorSelectors.ComponentStatusesButton]: createTestProps(
        EBalanceMonitorSelectors.ComponentStatusesButton,
    ),
    [EBalanceMonitorSelectors.CoinFilterSelector]: createTestProps(
        EBalanceMonitorSelectors.CoinFilterSelector,
    ),
    [EBalanceMonitorSelectors.PumpAndDumpButton]: createTestProps(
        EBalanceMonitorSelectors.PumpAndDumpButton,
    ),
};

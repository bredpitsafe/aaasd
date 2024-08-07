import type {
    TBalanceMonitorAccountId,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

// This type describes handler raw data and should not be used outside handlers
export type TRuleVertexRaw = {
    isAnyExchange: boolean;
    exchanges?: TExchangeId[];

    isAnyAccount: boolean;
    isTransitAccount: boolean;
    isTradingAccount: boolean;
    accounts?: TBalanceMonitorAccountId[];
};

// This type describes handler raw data and should not be used outside handlers
export type TCoinSelectorRaw = {
    isAnyCoin: boolean;
    coins?: TCoinId[];
};

export type TEmptySendBody = {};

export const BUFFER_INTERVAL = 3000;

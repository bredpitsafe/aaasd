import type {
    EInProgressSolutionStatus,
    ESuggestProblemKind,
    TAccountInfo,
    TAmount,
    TBalanceMonitorAccountId,
    TBalanceReconciliationStepId,
    TBlockchainNetworkId,
    TCoinConvertRate,
    TCoinId,
    TExchangeId,
    TExchangeStats,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export enum EAmountNotification {
    None = 'None',
    MinGreaterThanMax = 'Min greater than max',
    OutOfRange = 'Out of range',
}

export type TPlainSuggestion = {
    key: string;

    group: EPlainSuggestionGroup;

    coin: TCoinId;
    problemKind: ESuggestProblemKind;
    sourceExchange: TExchangeId;
    source: TBalanceMonitorAccountId;
    destinationExchange: TExchangeId;
    destination: TBalanceMonitorAccountId;
    network: TBlockchainNetworkId;
    amount: TAmount;
    suggestHash: number;

    id?: TBalanceReconciliationStepId;
    status?: EInProgressSolutionStatus;

    initialBalances?: Record<TBalanceMonitorAccountId, TAmount>;
    exchangeStats?: TExchangeStats;
    accounts?: TAccountInfo[];
    possibleTransfers?: TTransfer[];
    convertRate?: TCoinConvertRate;

    amountNotification: EAmountNotification;

    original: {
        sourceExchange: TExchangeId;
        source: TBalanceMonitorAccountId;
        destinationExchange: TExchangeId;
        destination: TBalanceMonitorAccountId;

        amount: TAmount;

        amountNotification: EAmountNotification;
    };
};

export enum EPlainSuggestionGroup {
    New = 'New',
    InProgress = 'In Progress',
    Future = 'Future',
}

export const SUGGEST_AMOUNT_DIGITS = 2;

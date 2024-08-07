import type { ISO, Opaque, Seconds } from '@common/types';

import type { TUserName } from '../../../modules/user';

export type TCoinId = Opaque<'Coin', string>;
export type TBalanceReconciliationStepId = Opaque<'Balance Reconciliation Solution ID', string>;
export type TBalanceMonitorAccountId = Opaque<'Balance Monitor Account', string>;
export type TBalanceMonitorSubAccountId = Opaque<'Balance Monitor Sub Account', string>;
export type TBalanceMonitorSubAccountSectionId = Opaque<
    'Balance Monitor Sub Account Section',
    string
>;
export type TBlockchainNetworkId = Opaque<'Blockchain Smart Contract Network', string>;
export type TAmount = Opaque<'Amount', number>;
export type TExchangeId = Opaque<'Exchange Name', string>;
export type TBlockchainTransactionId = Opaque<'Blockchain transaction ID', string>;
export type TRuleId = Opaque<'Transfer Blocking or Amount Limits Rule ID', string>;

export type TAccountInfo = {
    exchange: TExchangeId;
    account: TBalanceMonitorAccountId;
};

export type TSubAccountInfo = {
    subAccount: TSubAccount;
    coins: TCoinId[];
};

export type TSubAccount = {
    name: TBalanceMonitorSubAccountId;
    section: TBalanceMonitorSubAccountSectionId;
};

export type TCoinBalanceReconciliationSuggest = {
    coin: TCoinId;
    suggests: TBalanceReconciliationSuggest[];
};

export type TBalanceReconciliationSuggest = {
    problemKind: ESuggestProblemKind;
    initialBalances: Record<TBalanceMonitorAccountId, TAmount>;
    solution: TBalanceReconciliationStep | TBalanceReconciliationInProgressStep;
};

export type TBalanceReconciliationStep = {
    source: TAccountInfo;
    destination: TAccountInfo;
    network: TBlockchainNetworkId;
    amount: TAmount;
};

export type TBalanceReconciliationInProgressStep = TBalanceReconciliationStep & {
    id: TBalanceReconciliationStepId;
    status: EInProgressSolutionStatus;
};

export enum ESuggestProblemKind {
    XMinBalance = 'xminbalance',
    XMaxBalance = 'xmaxbalance',
    AMinBalance = 'aminbalance',
    AMaxBalance = 'amaxbalance',
    APrepareTransitIn = 'apreparetransitin',
    APrepareTransitOut = 'apreparetransitout',
}

export enum EInProgressSolutionStatus {
    // UI statuses

    Launched = 'launched',

    // Balance Monitor Backend statuses

    /** Translation is awaiting submission to ATF */
    Starting = 'starting',
    /** Translation is scheduled for ATF */
    Planned = 'planned',
    /** Transfer creation error */
    CreateError = 'create_error',

    // ATF statuses

    /** Transfer created at ATF */
    Created = 'created',
    /** Transfer is awaiting submission */
    Pending = 'pending',
    /** Transfer has been sent */
    Sent = 'sent',
    /** Transfer has been received by the recipient */
    Received = 'received',
    /** Transfer balance confirmed */
    ConfirmedBalance = 'confirm_balance',
    /** Transfer chain confirmed */
    ConfirmedChain = 'confirm_chain',
    /** Transfer has been successfully completed */
    Succeeded = 'succeeded',
    /** Transfer has been canceled */
    Cancelled = 'cancelled',
    /** Transfer error */
    Failed = 'failed',
    /** Transfer is incorrectly formed */
    Invalid = 'invalid',
    /** Transfer rejected by ATF */
    Rejected = 'rejected',
}

export type TFullInfoByCoin = {
    accountBalances: Record<TBalanceMonitorAccountId, TAmount>;
    coin: TCoinId;
    graph: TCoinInfoGraph;
    exchangeStats: TExchangeStats;
};

export type TCoinInfoGraph = {
    accounts: TAccountInfo[];
    possibleTransfers: TTransfer[];
};

export type TTransfer = {
    from: TAccountInfo;
    to: TAccountInfo;
    network: TBlockchainNetworkId;
    networkPriority: number;
    minSuggestTransfer: TAmount;
    maxSuggestTransfer: TAmount;
    minManualTransfer?: TAmount;
    maxManualTransfer?: TAmount;
    suggestedTransfer?: TAmount;
    isManualEnabled: boolean;
    isSuggestEnabled: boolean;
};

export type TExchangeStats = Record<TExchangeId, TExchangeInfo>;

export type TExchangeInfo = {
    minBalance: TAmount;
    maxBalance: TAmount;
    targetBalance: TAmount;
    newBalance: TAmount;
    currentBalance: TAmount;
    markup: TAmount;
};

export type TCoinConvertRate = {
    base: TCoinId;
    quote: TCoinId;
    rate: TAmount;
    timestamp: ISO;
};

export type TTransferAction = {
    coin: TCoinId;
    from: TBalanceMonitorAccountId;
    to: TBalanceMonitorAccountId;
    amount: TAmount;
    kind: ETransferKind;
    network?: TBlockchainNetworkId;
};

export enum ETransferKind {
    Manual = 'manual',
    SuggestEdited = 'suggestEdited',
    SuggestAccepted = 'suggestAccepted',
    Auto = 'auto',
}

export type TTransferHistoryItem = {
    name: string;
    clientId: string;
    coin: TCoinId;
    source: TAccountInfo;
    destination: TAccountInfo;
    network: TBlockchainNetworkId;
    amount: TAmount;
    createTime: ISO;
    startTime: ISO;
    updateTime: ISO;
    state: EInProgressSolutionStatus;
    stateMsg: string;
    stateMsgRaw: string;
    txid: TBlockchainTransactionId;
    txExplorers: string[];
    createMode: ETransferKind;
    amountUSD?: TAmount;
    srcFee?: TAmount;
    srcFeeUSD?: TAmount;
    balancePercent?: TAmount;
    reserveField1?: string;
    reserveField2?: string;
};

export type TCoinTransferDetailsItem = {
    coin: TCoinId;
    source: TAccountInfo;
    destination: TAccountInfo;
    network: TBlockchainNetworkId;
    exchangeMin: TAmount;
    exchangeMax: TAmount;
    accountMin: TAmount;
    accountMax: TAmount;
    reasons: string[];
    isManualEnabled: boolean;
    isSuggestEnabled: boolean;
    isAutoEnabled: boolean;
    priority: number;
};

export type TInternalTransfersInfo = {
    possibleTransfers: TPossibleInternalTransfer[];
};

export type TPossibleInternalTransfer = {
    mainAccount: TAccountInfo;
    subAccounts: TSubAccountInfo[];
};

export type TSubAccountBalance = {
    subAccount: TSubAccount;
    balances: Record<TCoinId, TAmount>;
};

export enum EInternalStatusStatus {
    // ATF statuses

    /** Transfer created at ATF */
    Created = 'created',
    /** Transfer has been successfully completed */
    Succeeded = 'succeeded',
    /** Transfer error */
    Failed = 'failed',
}

export type TInternalTransfer = {
    name: string;
    clientId: string;
    username: TUserName;
    coin: TCoinId;
    mainAccount: TAccountInfo;
    source: TSubAccount;
    destination: TSubAccount;
    amount: TAmount;
    createTime: ISO;
    startTime: ISO;
    updateTime: ISO;
    state: EInternalStatusStatus;
    stateMsg: string;
    transferID: string;
};

export type TInternalTransferAction = {
    mainAccount: TBalanceMonitorAccountId;
    from: TSubAccount;
    to: TSubAccount;
    coin: TCoinId;
    amount: TAmount;
};

export enum EWideExchanges {
    All = 'all',
}

export enum EWideAccounts {
    All = 'all',
    Transit = 'transit',
    Trading = 'trading',
}

export enum EWideCoins {
    All = 'all',
}

export type TRuleExchanges = TExchangeId[] | EWideExchanges;
export type TRuleAccounts = TBalanceMonitorAccountId[] | EWideAccounts;
export type TRuleCoins = TCoinId[] | EWideCoins;

export type TRuleVertex = {
    exchangesMatchRule: TRuleExchanges;
    accountsMatchRule: TRuleAccounts;
};

export enum ERuleGroups {
    All = 'all',
    Manual = 'manual',
    Suggest = 'suggest',
    None = 'none',
}

export type TTransferBlockingRuleCreate = TRuleCommon & {
    showAlert: boolean;
    disabledGroups: ERuleGroups;
    since?: ISO;
    until?: ISO;
};

export type TTransferBlockingRuleUpdate = TTransferBlockingRuleCreate & {
    id: TRuleId;
};

export enum ERuleActualStatus {
    Active = 'active',
    Waiting = 'waiting',
    Expired = 'expired',
}

export type TTransferBlockingRuleInfo = TTransferBlockingRuleCreate &
    TRuleMeta & {
        actualStatus: ERuleActualStatus;
    };

export type TAmountLimitsRuleCreate = TRuleCommon & {
    amountMin?: TAmount;
    amountMax?: TAmount;
    amountCurrency: TCoinId;
    rulePriority: number;
    doNotOverride: boolean;
};

export type TAmountLimitsRuleUpdate = TAmountLimitsRuleCreate & {
    id: TRuleId;
};

export type TAmountLimitsRuleInfo = TAmountLimitsRuleCreate & TRuleMeta;

export type TAutoTransferRuleCreate = TRuleCommon & {
    enableAuto: boolean;
    rulePriority: number;
};

export type TAutoTransferRuleUpdate = TAutoTransferRuleCreate & {
    id: TRuleId;
};

export type TAutoTransferRuleInfo = TAutoTransferRuleCreate & TRuleMeta;

type TRuleMeta = {
    id: TRuleId;
    username: TUserName;
    createTime: ISO;
    updateTime: ISO;
};

type TRuleCommon = {
    coinsMatchRule: TRuleCoins;
    source: TRuleVertex;
    destination: TRuleVertex;
    withOpposite: boolean;
    note?: string;
};

export enum EComponentStatus {
    Starting = 'Starting',
    Started = 'Started',
    Stopped = 'Stopped',
    Alarm = 'Alarm',
    Failed = 'Failed',
}

export type TComponentStatusInfo = {
    componentId: string;
    status: EComponentStatus;
    description: string;
};

export enum EBalanceMonitorLayoutPermissions {
    BalanceMonitor = 'BalanceMonitor',
    InternalTransfers = 'InternalTransfers',
    LimitingTransferRules = 'LimitingTransferRules',
    BlockingTransferRules = 'BlockingTransferRules',
    AutoTransferRules = 'AutoTransferRules',
}

export type TCoinRateDelta = {
    startRate: TCoinConvertRate;
    endRate: TCoinConvertRate;
    timeInterval: Seconds;
    flagged: boolean;
};

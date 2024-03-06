import type {
    TRuleAccounts,
    TRuleCoins,
    TRuleExchanges,
    TRuleId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TRuleCommonFormData = {
    id?: TRuleId;
    coinsMatchRule: TRuleCoins;
    sourceExchangesMatchRule: TRuleExchanges;
    sourceAccountsMatchRule: TRuleAccounts;
    destinationExchangesMatchRule: TRuleExchanges;
    destinationAccountsMatchRule: TRuleAccounts;
    withOpposite: boolean;
    note?: string;
};

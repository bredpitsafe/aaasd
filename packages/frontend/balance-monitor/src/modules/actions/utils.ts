import type {
    TRuleCoins,
    TRuleVertex,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    EWideAccounts,
    EWideCoins,
    EWideExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

import type { TCoinSelectorRaw, TRuleVertexRaw } from './defs';

export function convertToServerRuleVertex(vertex: TRuleVertex): TRuleVertexRaw {
    return {
        isAnyExchange: vertex.exchangesMatchRule === EWideExchanges.All,
        exchanges:
            vertex.exchangesMatchRule !== EWideExchanges.All
                ? vertex.exchangesMatchRule
                : undefined,

        isAnyAccount: vertex.accountsMatchRule === EWideAccounts.All,
        isTransitAccount: vertex.accountsMatchRule === EWideAccounts.Transit,
        isTradingAccount: vertex.accountsMatchRule === EWideAccounts.Trading,
        accounts:
            vertex.accountsMatchRule !== EWideAccounts.All &&
            vertex.accountsMatchRule !== EWideAccounts.Transit &&
            vertex.accountsMatchRule !== EWideAccounts.Trading
                ? vertex.accountsMatchRule
                : undefined,
    };
}

export function convertToClientRuleVertex({
    isAnyExchange,
    isAnyAccount,
    isTransitAccount,
    isTradingAccount,
    exchanges,
    accounts,
}: TRuleVertexRaw): TRuleVertex {
    return {
        exchangesMatchRule: isAnyExchange ? EWideExchanges.All : exchanges ?? [],
        accountsMatchRule: isAnyAccount
            ? EWideAccounts.All
            : isTransitAccount
              ? EWideAccounts.Transit
              : isTradingAccount
                ? EWideAccounts.Trading
                : accounts ?? [],
    };
}

export function convertToServerRuleCoin(coin: TRuleCoins): TCoinSelectorRaw {
    return {
        isAnyCoin: coin === EWideCoins.All,
        coins: coin !== EWideCoins.All ? coin : undefined,
    };
}

export function convertToClientRuleCoin({ isAnyCoin, coins }: TCoinSelectorRaw): TRuleCoins {
    return isAnyCoin ? EWideCoins.All : coins ?? [];
}

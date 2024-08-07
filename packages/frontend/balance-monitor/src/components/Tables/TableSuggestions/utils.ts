import type {
    InitialGroupOrderComparatorParams,
    RowClassParams,
    RowClassRules,
} from '@frontend/ag-grid';
import type {
    TAmount,
    TBalanceMonitorAccountId,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ESuggestProblemKind } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';

import type { TPlainSuggestion } from './defs';
import { EPlainSuggestionGroup } from './defs';
import { cnRowStyles } from './view.css';

export const ROW_CLASS_RULES: RowClassRules<TPlainSuggestion> = {
    [cnRowStyles.suggests]: ({ node }: RowClassParams<TPlainSuggestion>) =>
        node.key === EPlainSuggestionGroup.New,
    [cnRowStyles.inProgress]: ({ node }: RowClassParams<TPlainSuggestion>) =>
        node.key === EPlainSuggestionGroup.InProgress,
    [cnRowStyles.future]: ({ node }: RowClassParams<TPlainSuggestion>) =>
        node.key === EPlainSuggestionGroup.Future,
    [cnRowStyles.xmaxbalance]: ({ data }: RowClassParams<TPlainSuggestion>) =>
        data?.problemKind === ESuggestProblemKind.XMaxBalance,
    [cnRowStyles.amaxbalance]: ({ data }: RowClassParams<TPlainSuggestion>) =>
        data?.problemKind === ESuggestProblemKind.AMaxBalance,
};

export function initialGroupOrderComparator(
    params: InitialGroupOrderComparatorParams<TPlainSuggestion>,
) {
    return params.nodeA.key === EPlainSuggestionGroup.New ? -1 : 1;
}

export function getSuggestHash(
    coin: TCoinId,
    source: TBalanceMonitorAccountId,
    destination: TBalanceMonitorAccountId,
    amount: TAmount,
): number {
    return shallowHash(coin, source, destination, amount);
}

export function getSuggestKey(
    coin: TCoinId,
    source: TBalanceMonitorAccountId,
    destination: TBalanceMonitorAccountId,
    group: EPlainSuggestionGroup,
): string {
    return `[${group}] COIN: ${coin} SOURCE: ${source} DEST: ${destination}`;
}

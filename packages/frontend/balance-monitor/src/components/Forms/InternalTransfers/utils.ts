import type {
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { intersection, isNil } from 'lodash-es';

import type { TSubAccountWithSections } from './hooks/useSubAccountsWithSections';

export function getIntersectionCoins(
    fromSubAccount: TBalanceMonitorSubAccountId | undefined,
    fromSection: TBalanceMonitorSubAccountSectionId | undefined,
    toSubAccount: TBalanceMonitorSubAccountId | undefined,
    toSection: TBalanceMonitorSubAccountSectionId | undefined,
    subAccountsWithSections: TSubAccountWithSections[] | undefined,
): TCoinId[] | undefined {
    if (
        isNil(fromSubAccount) ||
        isNil(fromSection) ||
        isNil(toSubAccount) ||
        isNil(toSection) ||
        isNil(subAccountsWithSections)
    ) {
        return undefined;
    }

    const fromCoins = subAccountsWithSections
        ?.find(({ name }) => name === fromSubAccount)
        ?.sections?.find(({ name }) => name === fromSection)?.coins;
    const toCoins = subAccountsWithSections
        ?.find(({ name }) => name === toSubAccount)
        ?.sections?.find(({ name }) => name === toSection)?.coins;

    if (isNil(fromCoins) || isNil(toCoins)) {
        return undefined;
    }

    return intersection(fromCoins, toCoins);
}

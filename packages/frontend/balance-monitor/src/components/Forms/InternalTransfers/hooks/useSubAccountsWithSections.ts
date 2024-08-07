import type {
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
    TCoinId,
    TSubAccountInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

export type TSubAccountWithSections = {
    name: TBalanceMonitorSubAccountId;
    sections: { name: TBalanceMonitorSubAccountSectionId; coins: TCoinId[] }[];
};

export function useSubAccountsWithSections(
    subAccountsWithCoins: TSubAccountInfo[] | undefined,
): TSubAccountWithSections[] | undefined {
    return useMemo(() => {
        if (isNil(subAccountsWithCoins) || subAccountsWithCoins.length === 0) {
            return undefined;
        }

        const map = new Map<TBalanceMonitorSubAccountId, TSubAccountWithSections['sections']>();

        const result: TSubAccountWithSections[] = [];

        for (const { subAccount, coins } of subAccountsWithCoins) {
            let subAccountWithSections = map.get(subAccount.name);
            if (isNil(subAccountWithSections)) {
                subAccountWithSections = [];
                map.set(subAccount.name, subAccountWithSections);
                result.push({ name: subAccount.name, sections: subAccountWithSections });
            }

            subAccountWithSections.push({
                name: subAccount.section,
                coins,
            });
        }

        return result;
    }, [subAccountsWithCoins]);
}

import type {
    TBalanceMonitorAccountId,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ConditionBuilder } from 'yup/lib/Condition';
import type StringSchema from 'yup/lib/string';

export function useSourceAccountValidation(
    coinInfoMap: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): ConditionBuilder<StringSchema> {
    return useFunction(
        (
            coin: TCoinId | undefined,
            otherAccount: TBalanceMonitorAccountId | undefined,
            schema: StringSchema,
            accountField: undefined | { value: TBalanceMonitorAccountId | undefined },
        ) => {
            if (isNil(accountField) || isNil(accountField.value) || isNil(coin)) {
                return schema;
            }

            const coinInfo = coinInfoMap.get(coin);

            if (isNil(coinInfo)) {
                return schema;
            }

            const accounts = coinInfo.graph.possibleTransfers.map(
                ({ from: { account } }) => account,
            );

            if (!accounts.includes(accountField.value)) {
                return schema.test({
                    test: () => false,
                    message: `No transfer found for source ${accountField.value}`,
                });
            }

            return isNil(otherAccount) ||
                coinInfo.graph.possibleTransfers.some(
                    ({ from: { account: accountValue }, to: { account: otherAccountValue } }) =>
                        accountValue === accountField.value && otherAccountValue === otherAccount,
                )
                ? schema
                : schema.test({
                      test: () => false,
                      message: `Transfer ${accountField.value} -> ${otherAccount} doesn't exist`,
                  });
        },
    ) as unknown as ConditionBuilder<StringSchema>;
}

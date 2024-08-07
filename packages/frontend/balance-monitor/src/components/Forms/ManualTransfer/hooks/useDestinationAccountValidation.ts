import type {
    TBalanceMonitorAccountId,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TFullInfoByCoin } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ConditionBuilder } from 'yup/lib/Condition';
import type StringSchema from 'yup/lib/string';

export function useDestinationAccountValidation(
    coinInfoMap: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): ConditionBuilder<StringSchema> {
    return useFunction(
        (
            coin: TCoinId | undefined,
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

            const accounts = coinInfo.graph.possibleTransfers.map(({ to: { account } }) => account);

            return accounts.includes(accountField.value)
                ? schema
                : schema.test({
                      test: () => false,
                      message: `No transfer found for destination ${accountField.value}`,
                  });
        },
    ) as unknown as ConditionBuilder<StringSchema>;
}

import type { KeyByType } from '@common/types';
import type {
    TCoinId,
    TFullInfoByCoin,
    TRuleAccounts,
    TRuleCoins,
    TRuleExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type {
    TAccountInfo,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isEmpty, isNil } from 'lodash-es';
import * as Yup from 'yup';
import type { ConditionBuilder } from 'yup/lib/Condition';
import type { MixedSchema } from 'yup/lib/mixed';
import type { ObjectShape } from 'yup/lib/object';

import { isEqualsComplexRuleValues } from '../../utils';
import type { TRuleCommonFormData } from './defs';

export function commonValidationShape(
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): ObjectShape {
    return {
        coinsMatchRule: Yup.mixed()
            .required('Required')
            .test(
                'validate-coin',
                'Coins not selected',
                (coinsMatchRule: TRuleCoins) => !isEmpty(coinsMatchRule),
            )
            .test(
                'coins-not-exists',
                'Coins are not valid',
                (coinsMatchRule: TRuleCoins) =>
                    !Array.isArray(coinsMatchRule) ||
                    coinsMatchRule.every((coin) => new Set(coinInfo.keys()).has(coin)),
            ),
        sourceExchangesMatchRule: Yup.mixed()
            .required('Required')
            .test(
                'validate-source-exchange',
                'Exchanges not selected',
                (exchangesMatchRule: TRuleExchanges) => !isEmpty(exchangesMatchRule),
            )
            .when('coinsMatchRule', createExchangeValidator(coinInfo, 'from')),
        sourceAccountsMatchRule: Yup.mixed()
            .required('Required')
            .test(
                'validate-source-account',
                'Accounts not selected',
                (accountsMatchRule: TRuleAccounts) => !isEmpty(accountsMatchRule),
            )
            .when(
                ['coinsMatchRule', 'sourceExchangesMatchRule'],
                createAccountValidator(coinInfo, 'from'),
            ),
        destinationExchangesMatchRule: Yup.mixed()
            .required('Required')
            .test(
                'validate-destination-exchange',
                'Exchanges not selected',
                (exchangesMatchRule: TRuleExchanges) => !isEmpty(exchangesMatchRule),
            )
            .when('coinsMatchRule', createExchangeValidator(coinInfo, 'to')),
        destinationAccountsMatchRule: Yup.mixed()
            .required('Required')
            .test(
                'validate-destination-account',
                'Accounts not selected',
                (accountsMatchRule: TRuleAccounts) => !isEmpty(accountsMatchRule),
            )
            .when(
                ['coinsMatchRule', 'destinationExchangesMatchRule'],
                createAccountValidator(coinInfo, 'to'),
            ),
        withOpposite: Yup.boolean().required('Required'),
        note: Yup.string().optional(),
    };
}

function createExchangeValidator(
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
    accountInfoField: KeyByType<TTransfer, TAccountInfo>,
): ConditionBuilder<MixedSchema> {
    return ((
        coinsMatchRule: TRuleCoins | undefined,
        schema: MixedSchema,
        exchangeField: undefined | { value: TRuleExchanges | undefined },
    ) => {
        if (isNil(coinsMatchRule) || isNil(exchangeField) || isNil(exchangeField.value)) {
            return schema;
        }

        const validExchangesSet = new Set(
            Array.from(coinInfo.values())
                .filter(
                    ({ coin }) =>
                        !Array.isArray(coinsMatchRule) ||
                        coinsMatchRule.length === 0 ||
                        coinsMatchRule.includes(coin),
                )
                .map(({ graph: { possibleTransfers } }) =>
                    possibleTransfers.map(({ [accountInfoField]: { exchange } }) => exchange),
                )
                .flat(),
        );

        return schema.test(
            `${accountInfoField}-exchanges-validation`,
            'Exchanges are not valid',
            () =>
                !Array.isArray(exchangeField.value) ||
                exchangeField.value.every((exchange) => validExchangesSet.has(exchange)),
        );
    }) as unknown as ConditionBuilder<MixedSchema>;
}

function createAccountValidator(
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
    accountInfoField: KeyByType<TTransfer, TAccountInfo>,
): ConditionBuilder<MixedSchema> {
    return ((
        coinsMatchRule: TRuleCoins | undefined,
        exchangesMatchRule: TRuleExchanges | undefined,
        schema: MixedSchema,
        accountField: undefined | { value: TRuleAccounts | undefined },
    ) => {
        if (
            isNil(coinsMatchRule) ||
            isNil(exchangesMatchRule) ||
            isNil(accountField) ||
            isNil(accountField.value)
        ) {
            return schema;
        }

        const validAccountsSet = new Set(
            Array.isArray(exchangesMatchRule) && exchangesMatchRule.length === 1
                ? Array.from(coinInfo.values())
                      .filter(
                          ({ coin }) =>
                              !Array.isArray(coinsMatchRule) ||
                              coinsMatchRule.length === 0 ||
                              coinsMatchRule.includes(coin),
                      )
                      .map(({ graph: { possibleTransfers } }) =>
                          possibleTransfers
                              .filter(
                                  ({ [accountInfoField]: { exchange } }) =>
                                      exchange === exchangesMatchRule[0],
                              )
                              .map(({ [accountInfoField]: { account } }) => account),
                      )
                      .flat()
                : [],
        );

        return schema.test(
            `${accountInfoField}-accounts-validation`,
            'Accounts are not valid',
            () =>
                !Array.isArray(accountField.value) ||
                accountField.value.every((exchange) => validAccountsSet.has(exchange)),
        );
    }) as unknown as ConditionBuilder<MixedSchema>;
}

export function areCommonRulesEqual(
    a: Partial<TRuleCommonFormData>,
    b: Partial<TRuleCommonFormData>,
): boolean {
    return (
        isEqualsComplexRuleValues(a.coinsMatchRule, b.coinsMatchRule) &&
        isEqualsComplexRuleValues(a.sourceExchangesMatchRule, b.sourceExchangesMatchRule) &&
        isEqualsComplexRuleValues(a.sourceAccountsMatchRule, b.sourceAccountsMatchRule) &&
        isEqualsComplexRuleValues(
            a.destinationExchangesMatchRule,
            b.destinationExchangesMatchRule,
        ) &&
        isEqualsComplexRuleValues(a.destinationAccountsMatchRule, b.destinationAccountsMatchRule) &&
        a.withOpposite === b.withOpposite &&
        areNotesEqual(a.note, b.note)
    );
}

function areNotesEqual(left: string | undefined, right: string | undefined) {
    const leftTrimmed = left?.trim();
    const rightTrimmed = right?.trim();

    return (isEmpty(leftTrimmed) && isEmpty(rightTrimmed)) || leftTrimmed === rightTrimmed;
}

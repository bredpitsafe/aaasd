import type {
    TBalanceMonitorAccountId,
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
    TCoinId,
    TPossibleInternalTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { intersection, isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { TestFunction } from 'yup';
import * as Yup from 'yup';
import type { ConditionBuilder } from 'yup/lib/Condition';
import type StringSchema from 'yup/lib/string';
import type { TestContext } from 'yup/lib/util/createValidation';

import type { TInternalTransferFormProps } from '../defs';

export function useSchema(internalTransferInfo: TPossibleInternalTransfer[]) {
    const validateMainAccount = useFunction(
        (mainAccount: TBalanceMonitorAccountId | undefined): boolean => {
            if (isNil(mainAccount)) {
                return true;
            }

            return internalTransferInfo.some(
                ({ mainAccount: { account } }) => account === mainAccount,
            );
        },
    ) as unknown as TestFunction<string | undefined>;

    const validateSubAccount = useFunction(
        (
            mainAccount: TBalanceMonitorAccountId | undefined,
            schema: StringSchema,
            subAccountField: undefined | { value: TBalanceMonitorSubAccountId | undefined },
        ) => {
            if (isNil(mainAccount) || isNil(subAccountField) || isNil(subAccountField.value)) {
                return schema;
            }

            const hasSubAccount = internalTransferInfo.some(
                ({ mainAccount: { account }, subAccounts }) =>
                    account === mainAccount &&
                    subAccounts.some(({ subAccount: { name } }) => name === subAccountField.value),
            );

            return hasSubAccount
                ? schema
                : schema.test({
                      test: () => false,
                      message: 'Sub account was removed',
                  });
        },
    ) as unknown as ConditionBuilder<StringSchema>;

    const validateSubAccountSection = useFunction(
        (
            mainAccount: TBalanceMonitorAccountId | undefined,
            subAccount: TBalanceMonitorSubAccountId | undefined,
            schema: StringSchema,
            sectionField: undefined | { value: TBalanceMonitorSubAccountSectionId | undefined },
        ) => {
            if (
                isNil(mainAccount) ||
                isNil(subAccount) ||
                isNil(sectionField) ||
                isNil(sectionField.value)
            ) {
                return schema;
            }

            const hasSubAccount = internalTransferInfo.some(
                ({ mainAccount: { account }, subAccounts }) =>
                    account === mainAccount &&
                    subAccounts.some(
                        ({ subAccount: { name, section } }) =>
                            name === subAccount && section === sectionField.value,
                    ),
            );

            return hasSubAccount
                ? schema
                : schema.test({
                      test: () => false,
                      message: 'Sub account section was removed',
                  });
        },
    ) as unknown as ConditionBuilder<StringSchema>;

    const validateCoin = useFunction(
        (
            mainAccount: TBalanceMonitorAccountId | undefined,
            fromSubAccount: TBalanceMonitorSubAccountId | undefined,
            fromSection: TBalanceMonitorSubAccountSectionId | undefined,
            toSubAccount: TBalanceMonitorSubAccountId | undefined,
            toSection: TBalanceMonitorSubAccountSectionId | undefined,
            schema: StringSchema,
            coinField: undefined | { value: TCoinId | undefined },
        ) => {
            if (
                isNil(mainAccount) ||
                isNil(fromSubAccount) ||
                isNil(fromSection) ||
                isNil(toSubAccount) ||
                isNil(toSection) ||
                isNil(coinField) ||
                isNil(coinField.value)
            ) {
                return schema;
            }

            const subAccountsWithCoins = internalTransferInfo.find(
                ({ mainAccount: { account } }) => account === mainAccount,
            )?.subAccounts;

            if (isNil(subAccountsWithCoins)) {
                return schema;
            }

            const fromCoins = subAccountsWithCoins.find(
                ({ subAccount: { name, section } }) =>
                    name === fromSubAccount && section === fromSection,
            )?.coins;

            if (isNil(fromCoins)) {
                return schema;
            }

            const toCoins = subAccountsWithCoins.find(
                ({ subAccount: { name, section } }) =>
                    name === toSubAccount && section === toSection,
            )?.coins;

            if (isNil(toCoins)) {
                return schema;
            }

            return intersection(fromCoins, toCoins).includes(coinField.value)
                ? schema
                : schema.test({
                      test: () => false,
                      message: 'Coin was removed',
                  });
        },
    ) as unknown as ConditionBuilder<StringSchema>;

    return useMemo(
        () =>
            Yup.object().shape({
                mainAccount: Yup.string()
                    .required('Required')
                    .test('validate-main-account', 'Main account was removed', validateMainAccount),
                fromSubAccount: Yup.string()
                    .required('Required')
                    .when(['mainAccount'], validateSubAccount),
                fromSection: Yup.string()
                    .required('Required')
                    .when(['mainAccount', 'fromSubAccount'], validateSubAccountSection),
                toSubAccount: Yup.string()
                    .required('Required')
                    .when(['mainAccount'], validateSubAccount)
                    .test(
                        'validate-same-account-and-section',
                        `Can't transfer to same Sub Account and Section`,
                        function (
                            toSubAccount: TBalanceMonitorSubAccountId | undefined,
                            context: TestContext,
                        ) {
                            const parent = context.parent as TInternalTransferFormProps | undefined;

                            return (
                                isNil(parent) ||
                                isNil(parent.fromSubAccount) ||
                                isNil(parent.fromSection) ||
                                isNil(toSubAccount) ||
                                isNil(parent.toSection) ||
                                parent.fromSubAccount !== toSubAccount ||
                                parent.fromSection !== parent.toSection
                            );
                        } as unknown as TestFunction<string | undefined>,
                    ),
                toSection: Yup.string()
                    .required('Required')
                    .when(['mainAccount', 'toSubAccount'], validateSubAccountSection)
                    .test(
                        'validate-same-account-and-section',
                        `Can't transfer to same Sub Account and Section`,
                        function (
                            toSection: TBalanceMonitorSubAccountSectionId | undefined,
                            context: TestContext,
                        ) {
                            const parent = context.parent as TInternalTransferFormProps | undefined;

                            return (
                                isNil(parent) ||
                                isNil(parent.fromSubAccount) ||
                                isNil(parent.fromSection) ||
                                isNil(parent.toSubAccount) ||
                                isNil(toSection) ||
                                parent.fromSubAccount !== parent.toSubAccount ||
                                parent.fromSection !== toSection
                            );
                        } as unknown as TestFunction<string | undefined>,
                    ),
                coin: Yup.string()
                    .required('Required')
                    .when(
                        [
                            'mainAccount',
                            'fromSubAccount',
                            'fromSection',
                            'toSubAccount',
                            'toSection',
                        ],
                        validateCoin,
                    ),
                amount: Yup.number()
                    .nullable(true)
                    .required('Required')
                    .moreThan(0, 'Amount should be greater then 0'),
            }),
        [validateMainAccount, validateSubAccount, validateSubAccountSection, validateCoin],
    );
}

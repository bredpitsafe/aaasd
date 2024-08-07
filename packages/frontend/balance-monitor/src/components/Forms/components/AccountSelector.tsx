import type { KeyByType } from '@common/types';
import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikRadioMultipleSelect } from '@frontend/common/src/components/Formik/components/FormikRadioMultipleSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TAccountInfo,
    TCoinId,
    TFullInfoByCoin,
    TRuleAccounts,
    TRuleExchanges,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EWideAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { FormikProps } from 'formik';
import { sortBy, uniqBy } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useEffect, useMemo } from 'react';

import { AccountWithExchangeIcon } from '../../AccountWithExchangeIcon';
import { DEFAULT_FILTER_OPTION } from '../../utils';
import type { TRuleCommonFormData } from './defs';

export const AccountSelector = memo(
    ({
        className,
        formik: { values, setFieldValue },
        coinInfo,
        label,
        accountInfoField,
        exchangeField,
        accountField,
    }: TWithClassname & {
        formik: FormikProps<Partial<TRuleCommonFormData>>;
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        label: string;
        accountInfoField: KeyByType<TTransfer, TAccountInfo>;
        exchangeField: KeyByType<TRuleCommonFormData, TRuleExchanges>;
        accountField: KeyByType<TRuleCommonFormData, TRuleAccounts>;
    }) => {
        const { [accountField]: accountFormValue, [exchangeField]: exchangeFormValue } = values;

        const accounts = useMemo(() => {
            if (!Array.isArray(exchangeFormValue) || exchangeFormValue.length !== 1) {
                return undefined;
            }

            return sortBy(
                uniqBy(
                    Array.from(coinInfo.values())
                        .filter(
                            ({ coin }) =>
                                !Array.isArray(values.coinsMatchRule) ||
                                values.coinsMatchRule.includes(coin),
                        )
                        .map(({ graph: { possibleTransfers } }) =>
                            possibleTransfers
                                .filter(
                                    ({ [accountInfoField]: { exchange } }) =>
                                        exchange === exchangeFormValue[0],
                                )
                                .map(({ [accountInfoField]: account }) => account),
                        )
                        .flat(),
                    ({ account }) => account,
                ),
                ({ account }) => account,
            );
        }, [exchangeFormValue, coinInfo, accountInfoField, values.coinsMatchRule]);

        const accountsSet = useMemo(
            () => new Set(accounts?.map(({ account }) => account)),
            [accounts],
        );

        useEffect(() => {
            if (!Array.isArray(exchangeFormValue)) {
                if (accountFormValue !== EWideAccounts.All) {
                    setFieldValue(accountField, EWideAccounts.All);
                }
                return;
            }

            if (exchangeFormValue.length > 1) {
                if (Array.isArray(accountFormValue)) {
                    setFieldValue(accountField, EWideAccounts.All);
                }
                return;
            }
        }, [accountField, accountFormValue, exchangeFormValue, accountsSet, setFieldValue]);

        const accountOptions = useMemo(
            () =>
                accounts?.map(({ account, exchange }) => ({
                    label: <AccountWithExchangeIcon account={account} exchange={exchange} />,
                    value: account,
                })),

            [accounts],
        );

        const radioOptions: { label: ReactNode; value: EWideAccounts }[] = useMemo(() => {
            const all = {
                label: 'All',
                value: EWideAccounts.All,
            };

            if (!Array.isArray(exchangeFormValue)) {
                return [all];
            }

            return [
                all,
                {
                    label: 'Transit',
                    value: EWideAccounts.Transit,
                },
                {
                    label: 'Trading',
                    value: EWideAccounts.Trading,
                },
            ];
        }, [exchangeFormValue]);

        return (
            <FormikForm.Item className={className} name={accountField} label={label}>
                <FormikRadioMultipleSelect
                    {...CommonRuleTabProps[ECommonRuleTabSelectors.AccountSelector]}
                    name={accountField}
                    showSearch
                    options={accountOptions}
                    allowClear
                    filterOption={DEFAULT_FILTER_OPTION}
                    radioOptions={radioOptions}
                    placeholder="Select Account"
                />
            </FormikForm.Item>
        );
    },
);

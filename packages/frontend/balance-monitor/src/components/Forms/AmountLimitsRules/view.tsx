import type { Nil } from '@common/types';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    type TCoinConvertRate,
    EWideAccounts,
    EWideCoins,
    EWideExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { AmountLimitsRulesForm } from './AmountLimitsRulesForm';
import type { TAmountLimitsRuleFormData } from './defs';
import { useSchema } from './hooks/useSchema';

export const FALLBACK_COIN = 'USDT' as TCoinId;

const INITIAL_VALUES: TAmountLimitsRuleFormData = {
    coinsMatchRule: EWideCoins.All,

    sourceExchangesMatchRule: EWideExchanges.All,
    sourceAccountsMatchRule: EWideAccounts.All,
    destinationExchangesMatchRule: EWideExchanges.All,
    destinationAccountsMatchRule: EWideAccounts.All,

    withOpposite: false,

    note: undefined,

    amountMin: undefined,
    amountMax: undefined,
    amountCurrency: FALLBACK_COIN,

    rulePriority: 5,
    doNotOverride: true,
};

export const AmountLimitsRules = memo(
    ({
        coinInfo,
        convertRates,
        createAmountLimitsRule,
        createAmountLimitsRuleInProgress,
        editFormData,
    }: {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        createAmountLimitsRule: (
            props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate,
        ) => Promise<boolean>;
        createAmountLimitsRuleInProgress: boolean;
        editFormData?: TAmountLimitsRuleFormData;
    }) => {
        const handleSubmit = useFunction(
            async (
                formValues: Partial<TAmountLimitsRuleFormData>,
                { setTouched, setValues }: FormikHelpers<Partial<TAmountLimitsRuleFormData>>,
            ) => {
                if (
                    isNil(formValues.coinsMatchRule) ||
                    isNil(formValues.sourceExchangesMatchRule) ||
                    isNil(formValues.sourceAccountsMatchRule) ||
                    isNil(formValues.destinationExchangesMatchRule) ||
                    isNil(formValues.destinationAccountsMatchRule) ||
                    isNil(formValues.withOpposite) ||
                    (isNil(formValues.amountMin) && isNil(formValues.amountMax)) ||
                    isNil(formValues.amountCurrency) ||
                    isNil(formValues.rulePriority) ||
                    isNil(formValues.doNotOverride)
                ) {
                    return;
                }

                const commonParams: TAmountLimitsRuleCreate = {
                    coinsMatchRule: formValues.coinsMatchRule,
                    source: {
                        exchangesMatchRule: formValues.sourceExchangesMatchRule,
                        accountsMatchRule: formValues.sourceAccountsMatchRule,
                    },
                    destination: {
                        exchangesMatchRule: formValues.destinationExchangesMatchRule,
                        accountsMatchRule: formValues.destinationAccountsMatchRule,
                    },
                    withOpposite: formValues.withOpposite,
                    note: formValues.note,

                    amountMin: formValues.amountMin,
                    amountMax: formValues.amountMax,
                    amountCurrency: formValues.amountCurrency,
                    rulePriority: formValues.rulePriority,
                    doNotOverride: formValues.doNotOverride,
                };

                const result = await createAmountLimitsRule(
                    isNil(editFormData) || isNil(editFormData.id)
                        ? commonParams
                        : ({ id: editFormData.id, ...commonParams } as TAmountLimitsRuleUpdate),
                );

                if (result) {
                    if (isNil(editFormData)) {
                        setTouched({}, false);
                    }
                    setValues(editFormData ?? INITIAL_VALUES, true);
                }
            },
        );

        const initialTouched = useMemo(
            () =>
                isNil(editFormData)
                    ? {}
                    : {
                          coinsMatchRule: true,
                          sourceExchangesMatchRule: true,
                          sourceAccountsMatchRule: true,
                          destinationExchangesMatchRule: true,
                          destinationAccountsMatchRule: true,
                          amountMin: true,
                          amountMax: true,
                          rulePriority: true,
                          doNotOverride: true,
                      },
            [editFormData],
        );

        const schema = useSchema(coinInfo);

        return (
            <Formik<Partial<TAmountLimitsRuleFormData>>
                enableReinitialize
                initialValues={editFormData ?? INITIAL_VALUES}
                initialTouched={initialTouched}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
                validateOnBlur
            >
                {(formik) => (
                    <AmountLimitsRulesForm
                        formik={formik}
                        coinInfo={coinInfo}
                        convertRates={convertRates}
                        editFormData={editFormData}
                        createAmountLimitsRuleInProgress={createAmountLimitsRuleInProgress}
                    />
                )}
            </Formik>
        );
    },
);

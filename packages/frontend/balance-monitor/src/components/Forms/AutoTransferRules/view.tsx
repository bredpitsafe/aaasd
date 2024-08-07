import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    EWideAccounts,
    EWideCoins,
    EWideExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { AutoTransferRulesForm } from './AutoTransferRulesForm';
import type { TAutoTransferRuleFormData } from './defs';
import { useSchema } from './hooks/useSchema';

const INITIAL_VALUES: TAutoTransferRuleFormData = {
    coinsMatchRule: EWideCoins.All,

    sourceExchangesMatchRule: EWideExchanges.All,
    sourceAccountsMatchRule: EWideAccounts.All,
    destinationExchangesMatchRule: EWideExchanges.All,
    destinationAccountsMatchRule: EWideAccounts.All,

    withOpposite: false,

    note: undefined,

    enableAuto: true,

    rulePriority: 5,
};

export const AutoTransferRules = memo(
    ({
        coinInfo,
        createAutoTransferRule,
        createAutoTransferRuleInProgress,
        editFormData,
    }: {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        createAutoTransferRule: (
            props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate,
        ) => Promise<boolean>;
        createAutoTransferRuleInProgress: boolean;
        editFormData?: TAutoTransferRuleFormData;
    }) => {
        const handleSubmit = useFunction(
            async (
                formValues: Partial<TAutoTransferRuleFormData>,
                { setTouched, setValues }: FormikHelpers<Partial<TAutoTransferRuleFormData>>,
            ) => {
                if (
                    isNil(formValues.coinsMatchRule) ||
                    isNil(formValues.sourceExchangesMatchRule) ||
                    isNil(formValues.sourceAccountsMatchRule) ||
                    isNil(formValues.destinationExchangesMatchRule) ||
                    isNil(formValues.destinationAccountsMatchRule) ||
                    isNil(formValues.withOpposite) ||
                    isNil(formValues.enableAuto) ||
                    isNil(formValues.rulePriority)
                ) {
                    return;
                }

                const commonParams: TAutoTransferRuleCreate = {
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

                    enableAuto: formValues.enableAuto,
                    rulePriority: formValues.rulePriority,
                };

                const result = await createAutoTransferRule(
                    isNil(editFormData) || isNil(editFormData.id)
                        ? commonParams
                        : ({ id: editFormData.id, ...commonParams } as TAutoTransferRuleUpdate),
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
                          enableAuto: true,
                          rulePriority: true,
                      },
            [editFormData],
        );

        const schema = useSchema(coinInfo);

        return (
            <Formik<Partial<TAutoTransferRuleFormData>>
                enableReinitialize
                initialValues={editFormData ?? INITIAL_VALUES}
                initialTouched={initialTouched}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
                validateOnBlur
            >
                {(formik) => (
                    <AutoTransferRulesForm
                        formik={formik}
                        coinInfo={coinInfo}
                        createAutoTransferRuleInProgress={createAutoTransferRuleInProgress}
                        editFormData={editFormData}
                    />
                )}
            </Formik>
        );
    },
);

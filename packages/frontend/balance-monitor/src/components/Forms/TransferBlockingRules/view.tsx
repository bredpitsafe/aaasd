import type { ISO, TimeZone } from '@common/types';
import { getNowDayjs, milliseconds2iso, toDayjsWithTimezone } from '@common/utils';
import type {
    TCoinId,
    TFullInfoByCoin,
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    ERuleGroups,
    EWideAccounts,
    EWideCoins,
    EWideExchanges,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TTransferBlockingRuleFormData } from './defs';
import { useSchema } from './hooks/useSchema';
import { TransferBlockingRulesForm } from './TransferBlockingRulesForm';

const INITIAL_PERIOD_VALUES = {
    startImmediately: true,
    startTime: undefined,
    selectEndDate: true,
    endTime: undefined,
    periodValue: undefined,
    periodUnit: 'days' as TTransferBlockingRuleFormData['periodUnit'],
};

export const INITIAL_VALUES: TTransferBlockingRuleFormData = {
    coinsMatchRule: EWideCoins.All,

    sourceExchangesMatchRule: EWideExchanges.All,
    sourceAccountsMatchRule: EWideAccounts.All,
    destinationExchangesMatchRule: EWideExchanges.All,
    destinationAccountsMatchRule: EWideAccounts.All,

    disabledGroups: ERuleGroups.All,

    withOpposite: false,
    showAlert: true,
    isPermanent: true,

    ...INITIAL_PERIOD_VALUES,

    note: undefined,
};

export const TransferBlockingRules = memo(
    ({
        timeZone,
        coinInfo,
        createTransferBlockingRule,
        createTransferBlockingRuleInProgress,
        editFormData,
    }: {
        timeZone: TimeZone;
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        createTransferBlockingRule: (
            props: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate,
        ) => Promise<boolean>;
        createTransferBlockingRuleInProgress: boolean;
        editFormData?: TTransferBlockingRuleFormData;
    }) => {
        const handleSubmit = useFunction(
            async (
                formValues: Partial<TTransferBlockingRuleFormData>,
                { setTouched, setValues }: FormikHelpers<Partial<TTransferBlockingRuleFormData>>,
            ) => {
                if (
                    isNil(formValues.coinsMatchRule) ||
                    isNil(formValues.sourceExchangesMatchRule) ||
                    isNil(formValues.sourceAccountsMatchRule) ||
                    isNil(formValues.destinationExchangesMatchRule) ||
                    isNil(formValues.destinationAccountsMatchRule) ||
                    isNil(formValues.withOpposite) ||
                    isNil(formValues.disabledGroups) ||
                    isNil(formValues.showAlert) ||
                    (!formValues.isPermanent &&
                        ((!formValues.startImmediately && isNil(formValues.startTime)) ||
                            (formValues.selectEndDate
                                ? isNil(formValues.endTime)
                                : isNil(formValues.periodValue))))
                ) {
                    return;
                }

                const commonParams: TTransferBlockingRuleCreate = {
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
                    showAlert: formValues.showAlert,
                    disabledGroups: formValues.disabledGroups,
                    note: formValues.note,

                    ...createPeriod(timeZone, formValues),
                };

                const result = await createTransferBlockingRule(
                    isNil(editFormData) || isNil(editFormData.id)
                        ? commonParams
                        : ({ id: editFormData.id, ...commonParams } as TTransferBlockingRuleUpdate),
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
                          startTime: true,
                          endTime: true,
                      },
            [editFormData],
        );

        const schema = useSchema(coinInfo);

        return (
            <Formik<Partial<TTransferBlockingRuleFormData>>
                enableReinitialize
                initialValues={editFormData ?? INITIAL_VALUES}
                initialTouched={initialTouched}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => (
                    <TransferBlockingRulesForm
                        formik={formik}
                        timeZone={timeZone}
                        coinInfo={coinInfo}
                        createTransferBlockingRuleInProgress={createTransferBlockingRuleInProgress}
                        editFormData={editFormData}
                    />
                )}
            </Formik>
        );
    },
);

function createPeriod(
    timeZone: TimeZone,
    formValues: Partial<TTransferBlockingRuleFormData>,
): Pick<TTransferBlockingRuleCreate, 'since' | 'until'> {
    if (formValues.isPermanent) {
        return {};
    }

    const since =
        formValues.startImmediately || isNil(formValues.startTime)
            ? undefined
            : milliseconds2iso(formValues.startTime);

    if (formValues.selectEndDate) {
        return {
            since,
            until: isNil(formValues.endTime) ? undefined : milliseconds2iso(formValues.endTime),
        };
    }

    if (isNil(formValues.periodValue) || isNil(formValues.periodUnit)) {
        return { since };
    }

    const offsetPeriod =
        formValues.startImmediately || isNil(formValues.startTime)
            ? getNowDayjs(timeZone)
            : toDayjsWithTimezone(formValues.startTime, timeZone);

    return {
        since,
        until: offsetPeriod.add(formValues.periodValue, formValues.periodUnit).toISOString() as ISO,
    };
}

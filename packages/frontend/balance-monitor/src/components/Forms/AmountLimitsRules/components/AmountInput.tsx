import type { KeyByType, Nil } from '@common/types';
import {
    AddAmountLimitsRuleTabProps,
    EAddAmountLimitsRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TAmount,
    TCoinConvertRate,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { FormikProps } from 'formik';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { CONVERSION_DIGITS, OPPOSITE_CONVERSION_DIGITS } from '../../../defs';
import { formatBaseAmount, formatQuoteAmount } from '../../../utils';
import type { TAmountLimitsRuleFormData } from '../defs';
import { FALLBACK_COIN } from '../view';

export const AmountInput = memo(
    ({
        className,
        formik: { values },
        amountField,
        label,
        convertRates,
    }: TWithClassname & {
        amountField: KeyByType<TAmountLimitsRuleFormData, TAmount | undefined>;
        label: string;
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        formik: FormikProps<Partial<TAmountLimitsRuleFormData>>;
    }) => {
        const { [amountField]: amount } = values;

        const formattedUsdAmount = useMemo(() => {
            if (isNil(values.amountCurrency) || isNil(convertRates)) {
                return undefined;
            }

            if (values.amountCurrency !== FALLBACK_COIN) {
                const convertRate = convertRates.get(values.amountCurrency);

                if (isNil(convertRate)) {
                    return undefined;
                }

                return formatQuoteAmount(amount, convertRate, CONVERSION_DIGITS);
            }

            if (!Array.isArray(values.coinsMatchRule) || values.coinsMatchRule.length !== 1) {
                return undefined;
            }

            const convertRate = convertRates.get(values.coinsMatchRule[0]);

            if (isNil(convertRate)) {
                return undefined;
            }

            return formatBaseAmount(amount, convertRate, OPPOSITE_CONVERSION_DIGITS);
        }, [convertRates, values.amountCurrency, values.coinsMatchRule, amount]);

        return (
            <FormikForm.Item
                className={className}
                name={amountField}
                label={`${label}, ${values.amountCurrency} ${
                    isNil(formattedUsdAmount) ? '' : ` ~ ${formattedUsdAmount}`
                }`}
            >
                <FormikInputNumber
                    {...AddAmountLimitsRuleTabProps[EAddAmountLimitsRuleTabSelectors.AmountInput]}
                    name={amountField}
                    min={0}
                />
            </FormikForm.Item>
        );
    },
);

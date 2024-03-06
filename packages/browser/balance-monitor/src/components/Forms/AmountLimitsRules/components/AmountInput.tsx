import {
    AddAmountLimitsRuleTabProps,
    EAddAmountLimitsRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import type { KeyByType } from '@frontend/common/src/types';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TAmount } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import type { FormikProps } from 'formik';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TConvertRatesDescriptor } from '../../../../modules/observables/ModuleConvertRates';
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
        convertRatesDescriptor,
    }: TWithClassname & {
        amountField: KeyByType<TAmountLimitsRuleFormData, TAmount | undefined>;
        label: string;
        convertRatesDescriptor: TConvertRatesDescriptor;
        formik: FormikProps<Partial<TAmountLimitsRuleFormData>>;
    }) => {
        const { [amountField]: amount } = values;

        const formattedUsdAmount = useMemo(() => {
            if (isNil(values.amountCurrency) || !isSyncDesc(convertRatesDescriptor)) {
                return undefined;
            }

            if (values.amountCurrency !== FALLBACK_COIN) {
                const convertRate = convertRatesDescriptor.value.get(values.amountCurrency);

                if (isNil(convertRate)) {
                    return undefined;
                }

                return formatQuoteAmount(amount, convertRate, CONVERSION_DIGITS);
            }

            if (!Array.isArray(values.coinsMatchRule) || values.coinsMatchRule.length !== 1) {
                return undefined;
            }

            const convertRate = convertRatesDescriptor.value.get(values.coinsMatchRule[0]);

            if (isNil(convertRate)) {
                return undefined;
            }

            return formatBaseAmount(amount, convertRate, OPPOSITE_CONVERSION_DIGITS);
        }, [convertRatesDescriptor, values.amountCurrency, values.coinsMatchRule, amount]);

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

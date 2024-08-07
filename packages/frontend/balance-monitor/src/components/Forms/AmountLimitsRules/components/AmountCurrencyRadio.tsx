import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikRadioGroup } from '@frontend/common/src/components/Formik/components/FormikRadio';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { FormikProps } from 'formik';
import type { ReactNode } from 'react';
import { memo, useEffect, useMemo } from 'react';

import { CoinWithIcon } from '../../../CoinWithIcon';
import type { TAmountLimitsRuleFormData } from '../defs';
import { FALLBACK_COIN } from '../view';
import { cnCurrencyRadio, cnCurrencyRadioItem } from '../view.css';

export const AmountCurrencyRadio = memo(
    ({
        className,
        formik: { values, setFieldValue },
    }: TWithClassname & {
        formik: FormikProps<Partial<TAmountLimitsRuleFormData>>;
    }) => {
        useEffect(() => {
            if (
                (!Array.isArray(values.coinsMatchRule) || values.coinsMatchRule.length !== 1) &&
                values.amountCurrency !== FALLBACK_COIN
            ) {
                setFieldValue('amountCurrency', FALLBACK_COIN);
            }
        }, [values.coinsMatchRule, values.amountCurrency, setFieldValue]);

        const options: { label: ReactNode; value: TCoinId }[] = useMemo(() => {
            const options = [
                {
                    label: <CoinWithIcon className={cnCurrencyRadioItem} coin={FALLBACK_COIN} />,
                    value: FALLBACK_COIN,
                },
            ];
            return Array.isArray(values.coinsMatchRule) && values.coinsMatchRule.length === 1
                ? options.concat([
                      {
                          label: <CoinWithIcon coin={values.coinsMatchRule[0]} />,
                          value: values.coinsMatchRule[0],
                      },
                  ])
                : options;
        }, [values.coinsMatchRule]);

        return (
            <FormikForm.Item className={className} name="amountCurrency" label="Amount Currency">
                <FormikRadioGroup
                    className={cnCurrencyRadio}
                    name="amountCurrency"
                    options={options}
                    disabled={options.length === 1}
                />
            </FormikForm.Item>
        );
    },
);

import type { RadioChangeEvent } from 'antd';
import { useField } from 'formik';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { ReactElement } from 'react';

import {
    AddAmountLimitsRuleTabProps,
    EAddAmountLimitsRuleTabSelectors,
} from '../../../../e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { useFunction } from '../../../utils/React/useFunction';
import { RadioGroup, RadioGroupProps } from '../../Radio';

export type TFormikRadioProps = FormikFieldProps & RadioGroupProps;

export function FormikRadioGroup(props: TFormikRadioProps): ReactElement {
    const { name, validate, onChange, onBlur, ...restProps } = props;

    const [{ value }, , { setValue, setTouched }] = useField({ name, validate });

    const cbChange = useFunction(({ target: { value } }: RadioChangeEvent) => {
        setValue(value);
        onChange && onChange(value);
    });

    const cbBlur = useFunction(() => {
        setTouched(true);
        onBlur?.(value);
    });

    return (
        <RadioGroup
            {...AddAmountLimitsRuleTabProps[EAddAmountLimitsRuleTabSelectors.AmountCurrencyButton]}
            onChange={cbChange}
            value={value}
            onBlur={cbBlur}
            {...restProps}
        />
    );
}

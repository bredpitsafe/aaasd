import type { RadioChangeEvent } from 'antd';
import type { DefaultOptionType } from 'antd/lib/select';
import cn from 'classnames';
import { useField } from 'formik';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import type React from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { Radio } from '../../Radio';
import type { SelectProps, SelectValue } from '../../Select';
import { SelectAdvanced } from '../../SelectAdvanced';
import { cnRadioSelector, cnRadioSelectorEnabled, cnRadioSelectorGroup } from './style.css';

export type TFormikRadioMultipleSelectProps<T> = FormikFieldProps &
    Omit<SelectProps<T>, 'mode' | 'value'> & {
        radioOptions: DefaultOptionType[];
        children?: React.ReactNode;
    };

export function FormikRadioMultipleSelect<T extends SelectValue = SelectValue>(
    props: TFormikRadioMultipleSelectProps<T>,
): ReactElement {
    const { name, radioOptions, validate, onChange, onBlur, ...restProps } = props;

    const [{ value }, , { setValue, setTouched }] = useField({ name, validate });

    const cbSelectChange = useFunction((value: T, option) => {
        setValue(value);
        onChange?.(value, option);
    });

    const cbRadioChange = useFunction(({ target: { value } }: RadioChangeEvent) => {
        setValue(value);
        onChange?.(value, []);
    });

    const cbBlur = useFunction((value) => {
        setTouched(true);
        onBlur?.(value);
    });

    const isSelectorEnabled = Array.isArray(value);

    const cbFocus = useFunction(() => {
        if (!isSelectorEnabled) {
            setValue([]);
        }
    });

    return (
        <Radio.Group
            className={cnRadioSelectorGroup}
            size={restProps.size}
            value={isSelectorEnabled ? undefined : value}
            onChange={cbRadioChange}
            disabled={props.disabled}
        >
            {radioOptions.map(({ label, value }) => (
                <Radio.Button key={value} value={value}>
                    {label}
                </Radio.Button>
            ))}

            {(!isEmpty(props.options) || isSelectorEnabled) && (
                <SelectAdvanced<T>
                    onChange={cbSelectChange}
                    onBlur={cbBlur}
                    onFocus={cbFocus}
                    {...restProps}
                    tabIndex={isSelectorEnabled ? props.tabIndex : -1}
                    className={cn(
                        cnRadioSelector,
                        { [cnRadioSelectorEnabled]: isSelectorEnabled },
                        props.className,
                    )}
                    value={isSelectorEnabled ? (value as unknown as T) : undefined}
                    mode="multiple"
                />
            )}
        </Radio.Group>
    );
}

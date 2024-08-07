import type { FieldProps } from 'formik';
import { Field } from 'formik-antd';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import type { ReactElement } from 'react';
import type React from 'react';
import { useEffect, useMemo } from 'react';

import type { TWithChildren } from '../../../types/components';
import { useFunction } from '../../../utils/React/useFunction';
import type { SelectValue } from '../../Select';
import { Select } from '../../Select';
import type { TSelectAdvancedProps } from '../../SelectAdvanced';
import { SelectAdvanced } from '../../SelectAdvanced';
import type { TWithFormikField } from '../index';

export type TFormikSelectProps<T> = TWithChildren &
    FormikFieldProps &
    TSelectAdvancedProps<T> & { children?: React.ReactNode };

export function FormikSelect<T extends SelectValue = SelectValue>(
    props: TFormikSelectProps<T>,
): ReactElement {
    const { name, validate, fast, ...restProps } = props;
    return (
        // @ts-ignore
        <Field name={name} validate={validate} fast={fast}>
            {(field: FieldProps) => <FormikSelectField field={field} name={name} {...restProps} />}
        </Field>
    );
}

FormikSelect.Option = Select.Option;
FormikSelect.OptGroup = Select.OptGroup;

function FormikSelectField<T extends SelectValue = SelectValue>(
    props: TWithFormikField & TFormikSelectProps<T>,
): ReactElement {
    const { name, value, onChange, onBlur, children, ...restProps } = props;
    const {
        field,
        form: { setFieldValue, setFieldTouched },
    } = props.field;

    const selectValue = useMemo<T | undefined>(
        () => value ?? (field.value === '' || field.value === null ? undefined : field.value),
        [value, field.value],
    );

    useEffect(() => {
        setFieldValue(name, selectValue);
    }, [name, selectValue, setFieldValue]);

    const cbChange = useFunction((value: T, option) => {
        setFieldValue(name, value);
        onChange && onChange(value, option);
    });

    const cbBlur = useFunction((value) => {
        setFieldTouched(name);
        onBlur && onBlur(value);
    });

    return (
        <SelectAdvanced<T> onChange={cbChange} onBlur={cbBlur} value={field.value} {...restProps}>
            {children}
        </SelectAdvanced>
    );
}

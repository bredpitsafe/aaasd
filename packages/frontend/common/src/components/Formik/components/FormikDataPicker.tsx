import { toDayjsWithTimezone } from '@common/utils';
import dayjs from 'dayjs';
import type { FieldProps } from 'formik';
import { Field } from 'formik-antd';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import type { TDatePickerProps } from '../../DatePicker';
import { DatePicker } from '../../DatePicker';
import type { TWithFormikField } from '../index';

export type TFormikDatePickerProps = TDatePickerProps & FormikFieldProps;

export function FormikDatePicker(props: TFormikDatePickerProps): ReactElement {
    const { name, validate, fast, ...restProps } = props;

    return (
        // @ts-ignore
        <Field name={name} validate={validate} fast={fast}>
            {(field: FieldProps) => (
                <FormikDatePickerField field={field} name={name} {...restProps} />
            )}
        </Field>
    );
}

function FormikDatePickerField(props: TWithFormikField & TFormikDatePickerProps): ReactElement {
    const { name, onChange, ...restProps } = props;
    const {
        field,
        form: { setFieldValue, setFieldTouched },
    } = props.field;

    const value = useMemo(() => {
        if (isNil(field.value)) {
            return field.value;
        }

        return isNil(restProps.timeZone)
            ? dayjs(field.value)
            : toDayjsWithTimezone(field.value, restProps.timeZone);
    }, [field.value, restProps.timeZone]);

    const handleChange = useFunction((date, rawValue) => {
        setFieldTouched(name);
        setFieldValue(name, date ? date.valueOf() : undefined, true);
        onChange?.(date, rawValue);
    });

    return <DatePicker {...restProps} id={name} value={value} onChange={handleChange} />;
}

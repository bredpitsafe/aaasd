import cn from 'classnames';
import type { FieldProps } from 'formik';
import { Field } from 'formik-antd';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { isEmpty } from 'lodash-es';
import { ReactElement } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { ConfigFullEditor, TConfigFullEditorProps } from '../../Editors/ConfigFullEditor';
import type { TWithFormikField } from '../index';
import { cnDefault, cnError } from './style.css';

export function FormikConfigEditor(
    props: Pick<TConfigFullEditorProps, 'className' | 'readOnly' | 'language'> & FormikFieldProps,
): ReactElement {
    const { name, validate, fast, ...restProps } = props;
    return (
        // @ts-ignore
        <Field name={name} validate={validate} fast={fast}>
            {(field: FieldProps) => (
                <FormikConfigEditorField field={field} name={name} {...restProps} />
            )}
        </Field>
    );
}

function FormikConfigEditorField(
    props: TWithFormikField &
        FormikFieldProps &
        Pick<TConfigFullEditorProps, 'className' | 'readOnly' | 'language'>,
): ReactElement {
    const { name, className, ...restProps } = props;
    const {
        field,
        form: { setFieldValue, setFieldTouched },
        meta: { error },
    } = props.field;

    const handleChange = useFunction((value: string) => {
        setFieldTouched(name, true);
        setFieldValue(name, value, true);
    });

    return (
        <ConfigFullEditor
            {...restProps}
            className={cn(className, cnDefault, { [cnError]: !isEmpty(error) })}
            value={field.value}
            onChangeValue={handleChange}
        />
    );
}

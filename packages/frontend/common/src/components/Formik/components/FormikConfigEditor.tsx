import cn from 'classnames';
import type { FieldProps } from 'formik';
import { Field } from 'formik-antd';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import type { TConfigFullEditorProps } from '../../Editors/ConfigFullEditor';
import { ConfigFullEditor } from '../../Editors/ConfigFullEditor';
import { useTabEditorState } from '../../Editors/hooks/useTabEditorState';
import { EConfigEditorMode } from '../../Editors/types';
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
    const { name, className, readOnly, ...restProps } = props;
    const {
        field,
        form: { setFieldValue, setFieldTouched },
        meta: { initialValue: initialFieldValue, error },
    } = props.field;
    const [originalValue, setOriginalValue] = useState(initialFieldValue);
    const addTaskMode = initialFieldValue === undefined;
    const diffEnabledOnCloningMode = !readOnly && !addTaskMode;

    useEffect(() => {
        setOriginalValue(initialFieldValue);
    }, [initialFieldValue]);

    const { viewMode, changeViewMode } = useTabEditorState({
        key: props.name,
        viewMode: EConfigEditorMode.single,
    });

    const handleChange = useFunction((value: string) => {
        setFieldTouched(name, true);
        setFieldValue(name, value, true);
    });

    return (
        <ConfigFullEditor
            {...restProps}
            readOnly={readOnly}
            {...(diffEnabledOnCloningMode
                ? {
                      viewMode,
                      onChangeViewMode: changeViewMode,
                      onDiscard: () => setFieldValue(name, originalValue, true),
                      originalTitle: 'Original value',
                      modifiedTitle: 'Edited value',
                  }
                : {})}
            className={cn(className, cnDefault, { [cnError]: !isEmpty(error) })}
            modifiedValue={field.value}
            value={originalValue}
            onChangeValue={handleChange}
        />
    );
}

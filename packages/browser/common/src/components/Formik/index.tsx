import { FieldArray, FieldProps, FormikProps } from 'formik';
import { Form, Input, InputNumber, Switch } from 'formik-antd';
import { ComponentProps } from 'react';

import { DEFAULT_NUMBER_FORMATTER } from '../InputNumber';
import { FormikFormItem } from './components/FormikFormItem';

export type TWithFormik<T> = {
    formik: FormikProps<T>;
};

export type TWithFormikField = {
    field: FieldProps;
};

Form.Item = FormikFormItem;

export const FormikForm = Form;
export const FormikInput = Input;
export const FormikSwitch = Switch;
export const FormikInputNumber = ({
    formatter = DEFAULT_NUMBER_FORMATTER,
    ...restProps
}: ComponentProps<typeof InputNumber>) => {
    return <InputNumber formatter={formatter} {...restProps} />;
};
export const FormikFieldArray = FieldArray;

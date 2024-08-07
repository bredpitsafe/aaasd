import type { FieldProps, FormikProps } from 'formik';
import { FieldArray } from 'formik';
import type { InputNumber } from 'formik-antd';
import { Form, Input, Switch } from 'formik-antd';
import type { ComponentProps } from 'react';

import { DEFAULT_NUMBER_FORMATTER } from '../InputNumber';
import { FormikFormItem } from './components/FormikFormItem';
import { FormikInputNumberWithDecimalsZeroes } from './components/FormikInputNumberWithDecimalsZeroes';

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
    return <FormikInputNumberWithDecimalsZeroes formatter={formatter} {...restProps} />;
};
export const FormikFieldArray = FieldArray;

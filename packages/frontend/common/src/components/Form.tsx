import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';
import { Form } from 'antd';
import type { FormItemProps, FormProps } from 'antd/lib/form';

export const FormItem = Form.Item;

export { Form };
export type { FormProps, FormItemProps };

export const createFormItemStyle = (parent: string, style: StyleRule) => {
    globalStyle(`${parent} .ant-form-item`, style);
};

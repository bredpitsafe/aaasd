import type { FormItemProps } from 'formik-antd';
import { FormItem } from 'formik-antd';

/** This is a wrapper component for Formik's Form.Item to fix lost focus issues.
 * @see https://github.com/jannikbuschke/formik-antd/issues/200 */
export function FormikFormItem(props: FormItemProps) {
    return (
        <FormItem {...props} hasFeedback={false}>
            {props.children}
        </FormItem>
    );
}

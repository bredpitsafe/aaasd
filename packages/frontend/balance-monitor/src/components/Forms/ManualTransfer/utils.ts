import type { FormikProps } from 'formik';
import { isUndefined } from 'lodash-es';

import type { TManualTransferFormProps } from './defs';

export function resetFieldValue(
    formik: FormikProps<Partial<TManualTransferFormProps>>,
    fieldName: keyof TManualTransferFormProps,
) {
    if (!isUndefined(formik.values[fieldName])) {
        formik.setFieldValue(fieldName, undefined, false);
    }

    if (formik.touched[fieldName]) {
        formik.setFieldTouched(fieldName, false);
    }
}

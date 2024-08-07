import { validateYupSchema, yupToFormErrors } from 'formik';
import type { FormikErrors, FormikValues } from 'formik/dist/types';
import type { ObjectSchema, ValidationError } from 'yup';
import type { ObjectShape } from 'yup/lib/object';

export async function validateBySchema<TValues extends FormikValues, TSchema extends ObjectShape>(
    values: TValues,
    schema: ObjectSchema<TSchema>,
): Promise<FormikErrors<TValues> | true> {
    try {
        await validateYupSchema(values, schema);
        return true;
    } catch (err) {
        if ((err as ValidationError).name === 'ValidationError') {
            return yupToFormErrors(err);
        }
        throw err;
    }
}

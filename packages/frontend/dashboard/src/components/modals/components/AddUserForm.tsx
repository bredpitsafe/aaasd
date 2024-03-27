import { Button } from '@frontend/common/src/components/Button';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import type { TUserName } from '@frontend/common/src/modules/user';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik, FormikHelpers } from 'formik';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';
import * as Yup from 'yup';

import { cnAddUserFormContainer, cnAddUserFormInput, cnAddUserFormSubmit } from '../style.css';

type TUserFormParams = {
    user: TUserName;
};

const INITIAL_VALUE = { user: '' as TUserName };

export const AddUserForm = memo(
    ({ users, onAddUser }: { users: TUserName[]; onAddUser: (user: TUserName) => void }) => {
        const submit = useFunction(
            (values: TUserFormParams, formik: FormikHelpers<TUserFormParams>) => {
                onAddUser(values.user.trim() as TUserName);
                formik.resetForm();
            },
        );

        const schema = useMemo(
            () =>
                Yup.object().shape({
                    user: Yup.string()
                        .trim()
                        .matches(/^[a-z]*$/, 'Only low case latin letters are available')
                        .notOneOf(
                            users,
                            'To view all users, disable "Show only active permissions" as the user already exists',
                        ),
                }),
            [users],
        );

        return (
            <Formik<TUserFormParams>
                initialValues={INITIAL_VALUE}
                validationSchema={schema}
                onSubmit={submit}
                validateOnChange
                validateOnMount
            >
                {(formik) => (
                    <FormikForm layout="horizontal" className={cnAddUserFormContainer}>
                        <FormikForm.Item name="user" className={cnAddUserFormInput}>
                            <FormikInput name="user" placeholder="User name" />
                        </FormikForm.Item>
                        <FormikForm.Item name="submit" className={cnAddUserFormSubmit}>
                            <Button
                                htmlType={'submit'}
                                disabled={!formik.isValid || isEmpty(formik.values.user)}
                            >
                                Add user
                            </Button>
                        </FormikForm.Item>
                    </FormikForm>
                )}
            </Formik>
        );
    },
);

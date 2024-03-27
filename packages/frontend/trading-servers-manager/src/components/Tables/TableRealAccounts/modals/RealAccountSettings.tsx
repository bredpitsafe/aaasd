import { createTestProps } from '@frontend/common/e2e';
import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { ERealAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import {
    FormikFieldArray,
    FormikForm,
    FormikInput,
    TWithFormik,
} from '@frontend/common/src/components/Formik';
import { Modal } from '@frontend/common/src/components/Modals';
import { Space } from '@frontend/common/src/components/Space';
import { TUpdatableRealAccount } from '@frontend/common/src/handlers/accounts/def';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import { ReactElement, useCallback, useMemo } from 'react';
import * as Yup from 'yup';

import { RealAccountSettingsCredentials } from './components/RealAccountSettingsCredentials';
import { cnSpace, cnSubmitButton } from './RealAccountSettings.css';

type TRealAccountSettingsModalProps = {
    account?: TUpdatableRealAccount;
    onSave: (acc: TUpdatableRealAccount) => void;
    onCancel: () => void;
};

export enum EAccountFields {
    Name = 'name',
    ExchangeAccountId = 'exchangeAccountId',
    Credentials = 'credentials',
}

const Schema = Yup.object().shape({
    name: Yup.string().required(),
    exchangeAccountId: Yup.string().nullable(),
    credentials: Yup.array(
        Yup.object().shape({
            name: Yup.string().required(),
            key: Yup.string().required(),
            secret: Yup.string().required(),
            passphrase: Yup.string().nullable(),
        }),
    ),
});

export function RealAccountSettingsModal(props: TRealAccountSettingsModalProps): ReactElement {
    const { account, onSave } = props;

    const cbSave = useCallback((data: TUpdatableRealAccount) => onSave(data), [onSave]);

    const initialValues: TUpdatableRealAccount = useMemo(
        () =>
            account || {
                name: '',
                credentials: [
                    {
                        name: '',
                        key: '',
                        secret: '',
                        passphrase: '',
                    },
                ],
            },
        [account],
    );

    return (
        <Formik<TUpdatableRealAccount>
            initialValues={initialValues}
            validationSchema={Schema}
            onSubmit={cbSave}
        >
            {(formik) => <RealAccountSettingsModalForm formik={formik} {...props} />}
        </Formik>
    );
}

type TRealAccountSettingsModalFormProps = TWithFormik<TUpdatableRealAccount> &
    TRealAccountSettingsModalProps;

function RealAccountSettingsModalForm(props: TRealAccountSettingsModalFormProps): ReactElement {
    const { handleSubmit, dirty, isValid, isSubmitting, values } = props.formik;
    const isCreateMode = props.account === undefined;

    const cbSubmit = useFunction(() => handleSubmit());
    const disabled = isSubmitting || !dirty || !isValid;
    const okButtonProps = useMemo(
        () => ({
            disabled,
            ...createTestProps(EModalSelectors.SaveButton),
        }),
        [disabled],
    );
    const cancelButtonProps = useMemo(
        () => ({
            disabled: false,
            ...createTestProps(EModalSelectors.CancelButton),
        }),
        [],
    );

    return (
        <Modal
            title="Account"
            open
            okText="Save"
            onOk={cbSubmit}
            okButtonProps={okButtonProps}
            cancelButtonProps={cancelButtonProps}
            onCancel={props.onCancel}
        >
            <Space direction="vertical" className={cnSpace}>
                <FormikForm layout="vertical" requiredMark>
                    <FormikForm.Item name={EAccountFields.Name} label="Name" required>
                        <FormikInput
                            {...createTestProps(ERealAccountsNewAccountSelectors.NameInput)}
                            placeholder="Name"
                            name={EAccountFields.Name}
                            autoFocus
                        />
                    </FormikForm.Item>
                    <FormikForm.Item
                        name={EAccountFields.ExchangeAccountId}
                        label="Exchange Account ID"
                    >
                        <FormikInput
                            {...createTestProps(
                                ERealAccountsNewAccountSelectors.ExchangeAccountIDInput,
                            )}
                            placeholder="Exchange Account ID"
                            name={EAccountFields.ExchangeAccountId}
                        />
                    </FormikForm.Item>
                    <FormikFieldArray
                        name={EAccountFields.Credentials}
                        render={(arrayHelpers) => (
                            <RealAccountSettingsCredentials
                                createMode={isCreateMode}
                                credentials={values.credentials}
                                fieldArrayRenderProps={arrayHelpers}
                            />
                        )}
                    />

                    <Button htmlType="submit" className={cnSubmitButton} disabled={disabled} />
                </FormikForm>
            </Space>
        </Modal>
    );
}

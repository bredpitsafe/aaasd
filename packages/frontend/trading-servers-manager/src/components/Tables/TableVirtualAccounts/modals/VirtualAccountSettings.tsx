import { createTestProps } from '@frontend/common/e2e';
import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { EVirtualAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.new-account.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { FormikForm, FormikInput, TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Modal } from '@frontend/common/src/components/Modals';
import { SelectProps } from '@frontend/common/src/components/Select';
import { Space } from '@frontend/common/src/components/Space';
import { TRealAccount, TVirtualAccount } from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import { ReactElement, useCallback, useMemo } from 'react';
import * as Yup from 'yup';

import { cnSubmitButton } from './VirtualAccountSettings.css';

enum EVirtualAccountFields {
    Name = 'name',
    RealAccounts = 'realAccounts',
}

type TVirtualAccountSettingsModalProps = {
    account?: TVirtualAccount;
    realAccounts?: TRealAccount[];
    onSave: (
        id: TVirtualAccount['id'] | undefined,
        name: TVirtualAccount['name'],
        realAccounts: TRealAccount['id'][],
    ) => void;
    onCancel: () => void;
};

type FormValues = {
    name: string;
    realAccounts: TRealAccount['id'][];
};

const Schema = Yup.object().shape({
    name: Yup.string().required(),
    realAccounts: Yup.array().of(Yup.number()).min(1).required(),
});

export function VirtualAccountSettingsModal(
    props: TVirtualAccountSettingsModalProps,
): ReactElement {
    const { account, onSave } = props;
    const initialValues: FormValues = useMemo(
        () => ({
            name: account?.name || '',
            realAccounts: account?.realAccounts.map((acc) => acc.id) || [],
        }),
        [account],
    );

    const cbSave = useCallback(
        (data: FormValues) => onSave(account?.id, data.name, data.realAccounts),
        [onSave, account],
    );

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={Schema}
            onSubmit={cbSave}
        >
            {(formik) => <VirtualAccountSettingsModalForm formik={formik} {...props} />}
        </Formik>
    );
}

type TVirtualAccountSettingsModalFormProps = TWithFormik<FormValues> &
    TVirtualAccountSettingsModalProps;

function VirtualAccountSettingsModalForm(
    props: TVirtualAccountSettingsModalFormProps,
): ReactElement {
    const { handleSubmit, dirty, isValid, isSubmitting } = props.formik;
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

    const options: SelectProps['options'] = useMemo(
        () =>
            props.realAccounts?.map((acc) => ({
                label: acc.name,
                value: acc.id,
            })),
        [props.realAccounts],
    );

    return (
        <Modal
            title="Virtual Account"
            open
            okText="Save"
            onOk={cbSubmit}
            okButtonProps={okButtonProps}
            cancelButtonProps={cancelButtonProps}
            onCancel={props.onCancel}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <FormikForm layout="vertical" requiredMark>
                    <FormikForm.Item name={EVirtualAccountFields.Name} label="Name" required>
                        <FormikInput
                            {...createTestProps(EVirtualAccountsNewAccountSelectors.NameInput)}
                            placeholder="Name"
                            name={EVirtualAccountFields.Name}
                            autoFocus
                        />
                    </FormikForm.Item>
                    <FormikForm.Item
                        name={EVirtualAccountFields.RealAccounts}
                        label="Real Accounts"
                        required
                    >
                        <FormikSelect
                            {...createTestProps(
                                EVirtualAccountsNewAccountSelectors.RealAccountsSelect,
                            )}
                            placeholder="Real Accounts"
                            name={EVirtualAccountFields.RealAccounts}
                            mode="multiple"
                            options={options}
                            optionFilterProp="label"
                        />
                    </FormikForm.Item>
                    <Button htmlType="submit" className={cnSubmitButton} disabled={disabled} />
                </FormikForm>
            </Space>
        </Modal>
    );
}

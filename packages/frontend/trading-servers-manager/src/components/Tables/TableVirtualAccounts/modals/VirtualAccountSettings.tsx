import { generateTraceId } from '@common/utils';
import { createTestProps } from '@frontend/common/e2e';
import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { EVirtualAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.new-account.modal.selectors';
import type { ButtonProps } from '@frontend/common/src/components/Button';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInput, FormikSwitch } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Modal } from '@frontend/common/src/components/Modals';
import type { SelectProps } from '@frontend/common/src/components/Select';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import { INTERNAL_NAME_PREFIX } from '@frontend/common/src/modules/actions/accounts/def.ts';
import { ModuleCreateVirtualAccountsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleCreateVirtualAccountsOnCurrentStage.ts';
import { ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage.ts';
import { ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage.ts';
import { ModuleUpdateVirtualAccountsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleUpdateVirtualAccountsOnCurrentStage.ts';
import type { TRealAccount, TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import type { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import {
    createSyncedValueDescriptor,
    isLoadingValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { Formik } from 'formik';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { of } from 'rxjs';
import * as Yup from 'yup';

import { cnSubmitButton } from './VirtualAccountSettings.css';

enum EVirtualAccountFields {
    Name = 'name',
    IsInternal = 'isInternal',
    RealAccounts = 'realAccounts',
}

type TVirtualAccountSettingsModalProps = {
    accountId?: TVirtualAccountId;
    onClose: () => void;
};

type FormValues = {
    name: string;
    isInternal: boolean;
    realAccounts: TRealAccount['id'][];
};

const Schema = Yup.object().shape({
    name: Yup.string()
        .required()
        .test(
            'is-internal-name',
            'Name must start with `internal.` when Internal flag is enabled',
            function (value) {
                return !isNil(value) && this.parent.isInternal
                    ? value.startsWith(INTERNAL_NAME_PREFIX)
                    : true;
            },
        ),
    isInternal: Yup.boolean().test(
        'is-internal',
        'Flag must be enabled when Name starts with `internal.`',
        function (value) {
            return this.parent.name?.startsWith(INTERNAL_NAME_PREFIX) ? value === true : true;
        },
    ),
    realAccounts: Yup.array().of(Yup.number()).min(1).required(),
});

export function VirtualAccountSettingsModal(
    props: TVirtualAccountSettingsModalProps,
): ReactElement {
    const { accountId, onClose } = props;
    const subscribeToRealAccounts = useModule(ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage);
    const subscribeToVirtualAccounts = useModule(
        ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage,
    );
    const { confirm } = useModule(ModuleModals);

    const [createVirtualAccounts] = useNotifiedObservableFunction(
        useModule(ModuleCreateVirtualAccountsOnCurrentStage),
        {
            getNotifyTitle: () => ({
                success: 'Virtual account created successfully',
                loading: 'Creating virtual account...',
            }),
        },
    );
    const [updateVirtualAccounts] = useNotifiedObservableFunction(
        useModule(ModuleUpdateVirtualAccountsOnCurrentStage),
        {
            getNotifyTitle: () => ({
                success: 'Virtual account updated successfully',
                loading: 'Updating virtual account...',
            }),
        },
    );

    const traceId = useTraceId();
    const account$ = useMemo(() => {
        return isNil(accountId)
            ? of(createSyncedValueDescriptor(undefined))
            : subscribeToVirtualAccounts(undefined, { traceId }).pipe(
                  mapValueDescriptor((virtualAccounts) =>
                      createSyncedValueDescriptor(
                          virtualAccounts?.value.find((acc) => acc.id === accountId),
                      ),
                  ),
              );
    }, [accountId, subscribeToVirtualAccounts, traceId]);

    const accountDesc = useNotifiedValueDescriptorObservable(account$);
    const account = accountDesc.value;

    const realAccounts = useNotifiedValueDescriptorObservable(
        subscribeToRealAccounts(undefined, { traceId }),
    );

    const initialValues: FormValues = useMemo(
        () => ({
            name: account?.name || '',
            isInternal: account?.isInternal ?? false,
            realAccounts: account?.realAccounts.map((acc) => acc.id) || [],
        }),
        [account],
    );

    const cbSave = useFunction(async (values: FormValues) => {
        const { name, isInternal, realAccounts: realAccountIds } = values;
        const res = await confirm(`Do you want to save virtual account "${name}"?`);
        if (res) {
            if (account) {
                await updateVirtualAccounts(
                    [
                        {
                            ...account,
                            name,
                            isInternal,
                            realAccounts: realAccountIds.map((id) => ({
                                id,
                            })),
                        },
                    ],
                    { traceId: generateTraceId() },
                );
            } else {
                await createVirtualAccounts([{ name, isInternal, realAccountIds }], {
                    traceId: generateTraceId(),
                });
            }
            onClose();
        }
    });

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            enableReinitialize
            validationSchema={Schema}
            onSubmit={cbSave}
        >
            {(formik) => (
                <VirtualAccountSettingsModalForm
                    formik={formik}
                    realAccounts={realAccounts}
                    isLoading={isLoadingValueDescriptor(accountDesc)}
                    onClose={onClose}
                />
            )}
        </Formik>
    );
}

type TVirtualAccountSettingsModalFormProps = TWithFormik<FormValues> & {
    isLoading: boolean;
    realAccounts: TComponentValueDescriptor<TRealAccount[]>;
    onClose: () => void;
};

function VirtualAccountSettingsModalForm(
    props: TVirtualAccountSettingsModalFormProps,
): ReactElement {
    const { isLoading, realAccounts, onClose } = props;
    const { handleSubmit, dirty, isValid, isSubmitting, values } = props.formik;
    const cbSubmit = useFunction(() => handleSubmit());

    const loading = isLoading || isSubmitting;
    const disabled = !dirty || !isValid || loading;
    const okButtonProps: ButtonProps = useMemo(
        () => ({
            disabled,
            loading,
            ...createTestProps(EModalSelectors.SaveButton),
        }),
        [disabled, loading],
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
            realAccounts.value
                ?.map((acc) => ({
                    label: acc.name,
                    value: acc.id,
                }))
                .filter((acc) =>
                    values.isInternal ? acc.label.startsWith(INTERNAL_NAME_PREFIX) : true,
                ),
        [realAccounts, values.isInternal],
    );

    return (
        <Modal
            title="Virtual Account"
            open
            okText="Save"
            onOk={cbSubmit}
            okButtonProps={okButtonProps}
            cancelButtonProps={cancelButtonProps}
            onCancel={onClose}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <FormikForm
                    requiredMark
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    disabled={isSubmitting}
                >
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
                            loading={isLoadingValueDescriptor(realAccounts)}
                        />
                    </FormikForm.Item>
                    <FormikForm.Item name={EVirtualAccountFields.IsInternal} label="Internal">
                        <FormikSwitch
                            {...createTestProps(EVirtualAccountsNewAccountSelectors.InternalSwitch)}
                            name={EVirtualAccountFields.IsInternal}
                            loading={isLoading}
                        />
                    </FormikForm.Item>
                    <Button htmlType="submit" className={cnSubmitButton} disabled={disabled} />
                </FormikForm>
            </Space>
        </Modal>
    );
}

import { generateTraceId } from '@common/utils';
import { createTestProps } from '@frontend/common/e2e';
import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { ERealAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal.selectors';
import type { ButtonProps } from '@frontend/common/src/components/Button';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import {
    FormikFieldArray,
    FormikForm,
    FormikInput,
    FormikSwitch,
} from '@frontend/common/src/components/Formik';
import { Modal } from '@frontend/common/src/components/Modals';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import type { TUpdatableRealAccount } from '@frontend/common/src/modules/actions/accounts/def.ts';
import {
    ACCOUNT_SECRET,
    INTERNAL_KEY,
    INTERNAL_NAME_PREFIX,
} from '@frontend/common/src/modules/actions/accounts/def.ts';
import { ModuleCreateRealAccountsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleCreateRealAccountsOnCurrentStage.ts';
import { ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage.ts';
import { ModuleUpdateRealAccountsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleUpdateRealAccountsOnCurrentStage.ts';
import type { TAccountId } from '@frontend/common/src/types/domain/account.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { Formik } from 'formik';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { of } from 'rxjs';
import * as Yup from 'yup';

import { RealAccountSettingsCredentials } from './components/RealAccountSettingsCredentials';
import { cnSpace, cnSubmitButton } from './RealAccountSettings.css';

type TRealAccountSettingsModalProps = {
    accountId?: TAccountId;
    onCancel: () => void;
};

export enum EAccountFields {
    Name = 'name',
    ExchangeAccountId = 'exchangeAccountId',
    Credentials = 'credentials',
    IsInternal = 'isInternal',
}

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
    exchangeAccountId: Yup.string().nullable(),
    isInternal: Yup.boolean().test(
        'is-internal',
        'Flag must be enabled when Name starts with `internal.`',
        function (value) {
            return this.parent.name?.startsWith(INTERNAL_NAME_PREFIX) ? value === true : true;
        },
    ),
    credentials: Yup.array(
        Yup.object().shape({
            name: Yup.string()
                .required()
                .test(
                    'is-internal-credentials-name',
                    'Name must start with `internal.` when Internal flag is enabled',
                    function (value) {
                        return !isNil(value) && this.parent.isInternal
                            ? value.startsWith(INTERNAL_NAME_PREFIX)
                            : true;
                    },
                ),
            key: Yup.string()
                .required()
                .test(
                    'is-internal-credentials-key',
                    'Key must have value `InternalMarkets` when `Internal` flag is enabled',
                    function (value) {
                        return this.parent.isInternal === true ? value === INTERNAL_KEY : true;
                    },
                ),
            secret: Yup.string()
                .required()
                .test(
                    'is-internal-credentials-secret',
                    'Secret must have value `InternalMarkets` when `Internal` flag is enabled',
                    function (value) {
                        // Only check this value
                        return this.parent.isInternal === true && value !== ACCOUNT_SECRET
                            ? value === INTERNAL_KEY
                            : true;
                    },
                ),
            passphrase: Yup.string().nullable(),
            isInternal: Yup.boolean().test(
                'is-internal-credentials',
                'Flag must be enabled when Name starts with `internal.`',
                function (value) {
                    return this.parent.name?.startsWith(INTERNAL_NAME_PREFIX)
                        ? value === true
                        : true;
                },
            ),
        }),
    ),
});

export function RealAccountSettingsModal(props: TRealAccountSettingsModalProps): ReactElement {
    const { accountId, onCancel } = props;

    const traceId = useTraceId();
    const { confirm } = useModule(ModuleModals);
    const subscribeToRealAccounts = useModule(ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage);

    const account$ = useMemo(() => {
        return isNil(accountId)
            ? of(createSyncedValueDescriptor(undefined))
            : subscribeToRealAccounts(undefined, { traceId }).pipe(
                  mapValueDescriptor((virtualAccounts) =>
                      createSyncedValueDescriptor(
                          virtualAccounts?.value.find((acc) => acc.id === accountId),
                      ),
                  ),
              );
    }, [accountId, subscribeToRealAccounts, traceId]);

    const account = useNotifiedValueDescriptorObservable(account$);

    const [createRealAccounts] = useNotifiedObservableFunction(
        useModule(ModuleCreateRealAccountsOnCurrentStage),
        {
            getNotifyTitle: () => ({
                success: 'Real account created successfully',
                loading: 'Creating real account...',
            }),
        },
    );
    const [updateRealAccounts] = useNotifiedObservableFunction(
        useModule(ModuleUpdateRealAccountsOnCurrentStage),
        {
            getNotifyTitle: () => ({
                success: 'Real account updated successfully',
                loading: 'Updating real account...',
            }),
        },
    );

    const cbSave = useFunction(async (acc: TUpdatableRealAccount) => {
        const res = await confirm(`Do you want to save real account "${acc.name}"?`);
        if (res) {
            if (acc.id) {
                await updateRealAccounts([acc], { traceId: generateTraceId() });
            } else {
                await createRealAccounts([acc], { traceId: generateTraceId() });
            }
            onCancel();
        }
    });

    const initialValues: TUpdatableRealAccount = useMemo(
        () =>
            account.value || {
                name: '',
                isInternal: false,
                credentials: [
                    {
                        name: '',
                        key: '',
                        secret: '',
                        passphrase: '',
                        isInternal: false,
                    },
                ],
            },
        [account],
    );

    return (
        <Formik<TUpdatableRealAccount>
            initialValues={initialValues}
            enableReinitialize
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
    const isCreateMode = props.accountId === undefined;

    const cbSubmit = useFunction(() => handleSubmit());
    const disabled = isSubmitting || !dirty || !isValid;
    const okButtonProps: ButtonProps = useMemo(
        () => ({
            disabled,
            loading: isSubmitting,
            ...createTestProps(EModalSelectors.SaveButton),
        }),
        [disabled, isSubmitting],
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
                <FormikForm
                    requiredMark
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    disabled={isSubmitting}
                >
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
                        label="Exchange Acc. ID"
                    >
                        <FormikInput
                            {...createTestProps(
                                ERealAccountsNewAccountSelectors.ExchangeAccountIDInput,
                            )}
                            placeholder="Exchange Account ID"
                            name={EAccountFields.ExchangeAccountId}
                        />
                    </FormikForm.Item>
                    <FormikForm.Item name={EAccountFields.IsInternal} label="Internal">
                        <FormikSwitch
                            {...createTestProps(ERealAccountsNewAccountSelectors.InternalSwitch)}
                            name={EAccountFields.IsInternal}
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

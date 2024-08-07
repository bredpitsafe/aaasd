import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { createTestProps } from '@frontend/common/e2e';
import { ERealAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Collapse } from '@frontend/common/src/components/Collapse';
import { FormikForm, FormikInput, FormikSwitch } from '@frontend/common/src/components/Formik';
import type { TUpdatableRealAccount } from '@frontend/common/src/modules/actions/accounts/def.ts';
import { ACCOUNT_SECRET } from '@frontend/common/src/modules/actions/accounts/def.ts';
import type { FieldArrayRenderProps, FormikValues } from 'formik';

import { EAccountFields } from '../RealAccountSettings';

enum ECredentialsFields {
    Name = 'name',
    Key = 'key',
    Secret = 'secret',
    Passphrase = 'passphrase',
    IsInternal = 'isInternal',
}

const inputFields = [
    ECredentialsFields.Name,
    ECredentialsFields.Key,
    ECredentialsFields.Secret,
    ECredentialsFields.Passphrase,
];
const requiredFields = [ECredentialsFields.Name, ECredentialsFields.Key, ECredentialsFields.Secret];
const secretFields = [ECredentialsFields.Secret, ECredentialsFields.Passphrase];

type TRealAccountSettingsCredentialsProps = {
    fieldArrayRenderProps: FieldArrayRenderProps;
    credentials: TUpdatableRealAccount['credentials'];
    createMode: boolean;
};
export function RealAccountSettingsCredentials(props: TRealAccountSettingsCredentialsProps) {
    return (
        <>
            <Collapse defaultActiveKey={0}>
                {props.credentials.map((item, index) => {
                    const removeButton = (
                        <Button
                            {...createTestProps(
                                ERealAccountsNewAccountSelectors.DeleteCredentialsButton,
                            )}
                            key={index}
                            size="small"
                            type="ghost"
                            title="Delete credentials from this account"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.fieldArrayRenderProps.remove(index);
                            }}
                        />
                    );

                    const fields = inputFields.map((field) => {
                        const isSecret = isFieldSecret(
                            props.fieldArrayRenderProps.form.values,
                            field,
                            index,
                        );
                        const name = generateCredentialsFieldName(field, index);
                        const label = generateCredentialsFieldLabel(field);

                        // Display special placeholder for saved secret fields instead of `<secret>` string
                        const placeholder = generateCredentialsFieldPlaceholder(field, isSecret);
                        const value = isSecret
                            ? ''
                            : getFieldValue(props.fieldArrayRenderProps.form.values, field, index);

                        return (
                            <FormikForm.Item
                                key={field}
                                name={name}
                                label={label}
                                required={requiredFields.includes(field)}
                            >
                                <FormikInput
                                    value={value}
                                    placeholder={placeholder}
                                    name={name}
                                    {...createTestProps(
                                        ERealAccountsNewAccountSelectors.CredentialsInput,
                                    )}
                                />
                            </FormikForm.Item>
                        );
                    });

                    return (
                        <Collapse.Panel
                            key={index}
                            header={`Credentials ${index + 1}`}
                            extra={removeButton}
                        >
                            {fields}
                            <FormikForm.Item
                                key={ECredentialsFields.IsInternal}
                                name={generateCredentialsFieldName(
                                    ECredentialsFields.IsInternal,
                                    index,
                                )}
                                label="Internal"
                            >
                                <FormikSwitch
                                    {...createTestProps(
                                        ERealAccountsNewAccountSelectors.CredentialsInternalSwitch,
                                    )}
                                    name={generateCredentialsFieldName(
                                        ECredentialsFields.IsInternal,
                                        index,
                                    )}
                                />
                            </FormikForm.Item>
                        </Collapse.Panel>
                    );
                })}
            </Collapse>
            <Button
                {...createTestProps(ERealAccountsNewAccountSelectors.AddCredentialsButton)}
                icon={<PlusOutlined />}
                onClick={(e) => {
                    e.stopPropagation();
                    props.fieldArrayRenderProps.push({});
                }}
            >
                Add credentials
            </Button>
        </>
    );
}

function generateCredentialsFieldName(name: ECredentialsFields, index: number): string {
    return `${EAccountFields.Credentials}[${index}].${name}`;
}

function generateCredentialsFieldLabel(name: string): string {
    return name[0].toUpperCase() + name.slice(1);
}
function generateCredentialsFieldPlaceholder(name: string, isSecret: boolean): string {
    return `${generateCredentialsFieldLabel(name)}${isSecret ? ' (already saved)' : ''}`;
}

function isFieldSecret(values: FormikValues, name: ECredentialsFields, index: number): boolean {
    return secretFields.includes(name) && getFieldValue(values, name, index) === ACCOUNT_SECRET;
}
function getFieldValue(values: FormikValues, name: ECredentialsFields, index: number): string {
    return values.credentials?.[index]?.[name];
}

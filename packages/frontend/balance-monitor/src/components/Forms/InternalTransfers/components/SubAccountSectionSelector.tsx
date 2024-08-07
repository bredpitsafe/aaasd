import type { KeyByType } from '@common/types';
import {
    EInternalTransfersTabSelectors,
    InternalTransfersTabTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type {
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikProps } from 'formik';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { DEFAULT_FILTER_OPTION } from '../../../utils';
import type { TInternalTransferFormProps } from '../defs';
import type { TSubAccountWithSections } from '../hooks/useSubAccountsWithSections';
import { getIntersectionCoins } from '../utils';
import { INITIAL_VALUES } from '../view';

export const SubAccountSectionSelector = memo(
    ({
        formik: { values, resetForm, validateForm },
        subAccountsWithSections,
        label,
        editSubAccountField,
        editSubAccountSectionField,
        oppositeSubAccountField,
        oppositeSubAccountSectionField,
    }: {
        formik: FormikProps<Partial<TInternalTransferFormProps>>;
        subAccountsWithSections: TSubAccountWithSections[] | undefined;
        label: string;
        editSubAccountField: KeyByType<TInternalTransferFormProps, TBalanceMonitorSubAccountId>;
        editSubAccountSectionField: KeyByType<
            TInternalTransferFormProps,
            TBalanceMonitorSubAccountSectionId
        >;
        oppositeSubAccountField: KeyByType<TInternalTransferFormProps, TBalanceMonitorSubAccountId>;
        oppositeSubAccountSectionField: KeyByType<
            TInternalTransferFormProps,
            TBalanceMonitorSubAccountSectionId
        >;
    }) => {
        const {
            [editSubAccountField]: editSubAccount,
            [oppositeSubAccountField]: oppositeSubAccount,
            [oppositeSubAccountSectionField]: oppositeSubAccountSection,
        } = values;

        const sections = useMemo(() => {
            if (isNil(editSubAccount) || isNil(subAccountsWithSections)) {
                return undefined;
            }

            const sections = subAccountsWithSections
                .find(({ name }) => name === editSubAccount)
                ?.sections?.map(({ name }) => name);

            if (
                isNil(sections) ||
                isNil(oppositeSubAccount) ||
                isNil(oppositeSubAccountSection) ||
                editSubAccount !== oppositeSubAccount
            ) {
                return sections;
            }

            return sections.filter((name) => name !== oppositeSubAccountSection);
        }, [
            subAccountsWithSections,
            editSubAccount,
            oppositeSubAccount,
            oppositeSubAccountSection,
        ]);

        const sectionsOptions = useMemo(
            () =>
                isNil(sections) || sections.length === 0
                    ? undefined
                    : sections?.map((name) => ({
                          label: name,
                          value: name,
                      })),
            [sections],
        );

        const handleSectionChange = useFunction(
            (editSubAccountSection: TBalanceMonitorSubAccountSectionId | undefined) => {
                const {
                    mainAccount,
                    [editSubAccountField]: editSubAccount,
                    [oppositeSubAccountField]: oppositeSubAccount,
                    [oppositeSubAccountSectionField]: oppositeSubAccountSection,
                    coin,
                } = values;

                resetForm({
                    values: {
                        ...INITIAL_VALUES,
                        mainAccount,
                        [editSubAccountField]: editSubAccount,
                        [editSubAccountSectionField]: editSubAccountSection,
                        [oppositeSubAccountField]: oppositeSubAccount,
                        [oppositeSubAccountSectionField]: oppositeSubAccountSection,
                        coin:
                            !isNil(coin) &&
                            getIntersectionCoins(
                                editSubAccount,
                                editSubAccountSection,
                                oppositeSubAccount,
                                oppositeSubAccountSection,
                                subAccountsWithSections,
                            )?.includes(coin)
                                ? coin
                                : undefined,
                    },
                });
                void validateForm();
            },
        );

        return (
            <FormikForm.Item name={editSubAccountSectionField} label={label}>
                <FormikSelect
                    {...InternalTransfersTabTabProps[
                        EInternalTransfersTabSelectors.FromToSectionSelector
                    ]}
                    name={editSubAccountSectionField}
                    showSearch
                    options={sectionsOptions}
                    allowClear
                    disabled={isNil(sectionsOptions)}
                    onChange={handleSectionChange}
                    filterOption={DEFAULT_FILTER_OPTION}
                />
            </FormikForm.Item>
        );
    },
);

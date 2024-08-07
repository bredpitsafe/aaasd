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

export const SubAccountSelector = memo(
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
        const { [oppositeSubAccountField]: oppositeSubAccount } = values;

        const subAccounts = useMemo(
            () =>
                (isNil(oppositeSubAccount) || isNil(subAccountsWithSections)
                    ? subAccountsWithSections
                    : subAccountsWithSections.filter(
                          ({ name, sections }) =>
                              name !== oppositeSubAccount || sections.length > 1,
                      )
                )?.map(({ name }) => name),
            [subAccountsWithSections, oppositeSubAccount],
        );

        const subAccountsOptions = useMemo(
            () =>
                isNil(subAccounts) || subAccounts.length === 0
                    ? undefined
                    : subAccounts.map((name) => ({
                          label: name,
                          value: name,
                      })),
            [subAccounts],
        );

        const handleSubAccountChange = useFunction(
            (editSubAccount: TBalanceMonitorSubAccountId | undefined) => {
                const {
                    mainAccount,
                    [oppositeSubAccountField]: oppositeSubAccount,
                    [oppositeSubAccountSectionField]: oppositeSubAccountSection,
                    coin,
                } = values;
                const sections = subAccountsWithSections
                    ?.find(({ name }) => name === editSubAccount)
                    ?.sections?.filter(
                        ({ name }) =>
                            oppositeSubAccount != editSubAccount ||
                            name !== oppositeSubAccountSection,
                    );
                const editSubAccountSection =
                    isNil(sections) || sections.length === 0
                        ? undefined
                        : sections.length === 1
                          ? sections[0].name
                          : undefined;

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
            <FormikForm.Item name={editSubAccountField} label={label}>
                <FormikSelect
                    {...InternalTransfersTabTabProps[EInternalTransfersTabSelectors.FromToSelector]}
                    name={editSubAccountField}
                    showSearch
                    options={subAccountsOptions}
                    allowClear
                    disabled={isNil(subAccountsOptions)}
                    onChange={handleSubAccountChange}
                    filterOption={DEFAULT_FILTER_OPTION}
                />
            </FormikForm.Item>
        );
    },
);

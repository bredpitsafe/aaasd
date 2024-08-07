import {
    EInternalTransfersTabSelectors,
    InternalTransfersTabTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type {
    TAccountInfo,
    TBalanceMonitorAccountId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikProps } from 'formik';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import { memo, useMemo } from 'react';

import { AccountWithExchangeIcon } from '../../../AccountWithExchangeIcon';
import { DEFAULT_FILTER_OPTION } from '../../../utils';
import type { TInternalTransferFormProps } from '../defs';
import { INITIAL_VALUES } from '../view';
import { cnFullWidth } from '../view.css';

export const MainAccountSelector = memo(
    ({
        formik: { validateForm, resetForm },
        mainAccounts,
    }: {
        formik: FormikProps<Partial<TInternalTransferFormProps>>;
        mainAccounts: TAccountInfo[];
    }) => {
        const mainAccountsOptions: DefaultOptionType[] | undefined = useMemo(
            () =>
                mainAccounts.map(({ account, exchange }) => ({
                    label: <AccountWithExchangeIcon account={account} exchange={exchange} />,
                    value: account,
                })),
            [mainAccounts],
        );

        const handleMainAccountChange = useFunction(
            (mainAccount: TBalanceMonitorAccountId | undefined) => {
                resetForm({
                    values: {
                        ...INITIAL_VALUES,
                        mainAccount,
                    },
                });
                void validateForm();
            },
        );

        return (
            <FormikForm.Item className={cnFullWidth} name="mainAccount" label="Exchange / Account">
                <FormikSelect
                    {...InternalTransfersTabTabProps[
                        EInternalTransfersTabSelectors.AccountSelector
                    ]}
                    name="mainAccount"
                    showSearch
                    options={mainAccountsOptions}
                    allowClear
                    onChange={handleMainAccountChange}
                    filterOption={DEFAULT_FILTER_OPTION}
                    loading={mainAccounts.length === 0}
                />
            </FormikForm.Item>
        );
    },
);

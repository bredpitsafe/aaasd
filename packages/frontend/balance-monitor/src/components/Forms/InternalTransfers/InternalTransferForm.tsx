import { DoubleRightOutlined, WarningOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import {
    EInternalTransfersTabSelectors,
    InternalTransfersTabTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import { Input } from '@frontend/common/src/components/Input';
import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import type {
    TCoinConvertRate,
    TCoinId,
    TPossibleInternalTransfer,
    TSubAccountBalance,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { clamp, isNil, uniqBy } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';

import { CONVERSION_DIGITS, PERCENTAGE_DIGITS } from '../../defs';
import { LOW_BALANCE_USD_AMOUNT } from '../../Settings/hooks/defs';
import {
    formatAmountOrEmptyWithConversionRate,
    formattedPercentOrEmpty,
    getPercentageValue,
    getPercentOrEmpty,
    roundAmount,
} from '../../utils';
import { ReadonlyInputNumber } from '../components/ReadonlyInputNumber';
import { MANUAL_EDIT_AMOUNT_DIGITS } from '../ManualTransfer/defs';
import { cnActionButton, cnContainer } from '../view.css';
import { CoinSelector } from './components/CoinSelector';
import { MainAccountSelector } from './components/MainAccountSelector';
import { SubAccountSectionSelector } from './components/SubAccountSectionSelector';
import { SubAccountSelector } from './components/SubAccountSelector';
import type { TInternalTransferFormProps } from './defs';
import { BALANCE_DISPLAY_AMOUNT_DIGITS } from './defs';
import { useSubAccountsWithSections } from './hooks/useSubAccountsWithSections';
import { INITIAL_VALUES } from './view';
import {
    cnActionsContainerEx,
    cnActionsContainerWithOptions,
    cnAvailableReadonlyInput,
    cnFullWidth,
    cnInternalTransfersFormLayout,
    cnLowBalanceOptionContainer,
    cnPercentageInput,
    cnUseAllAvailableBalance,
    cnWarnColorIcon,
} from './view.css';

export const InternalTransferForm = memo(
    ({
        formik,
        convertRates,
        possibleInternalTransfers,
        internalSubAccountBalances,
        requestTransferInProgress,
        showLowBalanceCoins,
        onToggleShowLowBalanceCoins,
        onFormReset,
    }: TWithFormik<Partial<TInternalTransferFormProps>> & {
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        possibleInternalTransfers: TPossibleInternalTransfer[];
        internalSubAccountBalances: TSubAccountBalance[];
        requestTransferInProgress: boolean;
        showLowBalanceCoins: boolean;
        onToggleShowLowBalanceCoins: (value?: boolean) => void;
        onFormReset: VoidFunction;
    }) => {
        const { values, isValid, validateForm, setTouched, setValues } = formik;

        const mainAccounts = useMemo(
            () =>
                uniqBy(
                    possibleInternalTransfers.map(({ mainAccount }) => mainAccount),
                    ({ account }) => account,
                ),
            [possibleInternalTransfers],
        );

        const subAccountsWithCoins = useMemo(
            () =>
                possibleInternalTransfers.find(
                    ({ mainAccount: { account } }) => account === values.mainAccount,
                )?.subAccounts,
            [possibleInternalTransfers, values.mainAccount],
        );

        const balancesByCoin = useMemo(
            () =>
                internalSubAccountBalances.find(
                    ({ subAccount: { name, section } }) =>
                        name === values.fromSubAccount && section === values.fromSection,
                )?.balances,
            [internalSubAccountBalances, values.fromSection, values.fromSubAccount],
        );

        const handleReset = useFunction(() => {
            setTouched({}, false);
            setValues(INITIAL_VALUES, true);
            onFormReset();
        });

        useEffect(() => {
            void validateForm();
        }, [possibleInternalTransfers, validateForm]);

        const balance = useMemo(
            () => (isNil(values.coin) ? undefined : balancesByCoin?.[values.coin]),
            [balancesByCoin, values.coin],
        );

        const formattedBalance = useMemo(() => {
            if (isNil(values.coin)) {
                return undefined;
            }

            return formatAmountOrEmptyWithConversionRate(
                balance,
                convertRates?.get(values.coin),
                BALANCE_DISPLAY_AMOUNT_DIGITS,
                CONVERSION_DIGITS,
            );
        }, [balance, convertRates, values.coin]);

        const formattedPercentage = useMemo(
            () =>
                formattedPercentOrEmpty(
                    getPercentOrEmpty(values.amount, balance),
                    PERCENTAGE_DIGITS,
                ),
            [balance, values.amount],
        );

        const isOutsideBounds = useMemo(
            () => !isNil(values.amount) && !isNil(balance) && values.amount > balance,
            [values.amount, balance],
        );

        const changePercentage = useFunction((percentage: number | null) => {
            if (isNil(percentage) || isNil(balance)) {
                return;
            }

            const amount = getPercentageValue(
                balance,
                clamp(percentage, 0, 100),
                MANUAL_EDIT_AMOUNT_DIGITS,
            );

            formik.setFieldValue('amount', amount, true);
        });

        const setAmountToAllAvailable = useFunction(() =>
            formik.setFieldValue(
                'amount',
                isNil(balance) ? undefined : roundAmount(balance, BALANCE_DISPLAY_AMOUNT_DIGITS),
                true,
            ),
        );

        const subAccountsWithSections = useSubAccountsWithSections(subAccountsWithCoins);

        return (
            <FormikForm
                {...InternalTransfersTabTabProps[
                    EInternalTransfersTabSelectors.InternalTransfersTab
                ]}
                layout="vertical"
                className={cnContainer}
            >
                <div className={cnInternalTransfersFormLayout}>
                    <MainAccountSelector formik={formik} mainAccounts={mainAccounts} />

                    <SubAccountSelector
                        formik={formik}
                        subAccountsWithSections={subAccountsWithSections}
                        label="From"
                        editSubAccountField="fromSubAccount"
                        editSubAccountSectionField="fromSection"
                        oppositeSubAccountField="toSubAccount"
                        oppositeSubAccountSectionField="toSection"
                    />

                    <SubAccountSectionSelector
                        formik={formik}
                        subAccountsWithSections={subAccountsWithSections}
                        label="From Section"
                        editSubAccountField="fromSubAccount"
                        editSubAccountSectionField="fromSection"
                        oppositeSubAccountField="toSubAccount"
                        oppositeSubAccountSectionField="toSection"
                    />

                    <SubAccountSelector
                        formik={formik}
                        subAccountsWithSections={subAccountsWithSections}
                        label="To"
                        editSubAccountField="toSubAccount"
                        editSubAccountSectionField="toSection"
                        oppositeSubAccountField="fromSubAccount"
                        oppositeSubAccountSectionField="fromSection"
                    />

                    <SubAccountSectionSelector
                        formik={formik}
                        subAccountsWithSections={subAccountsWithSections}
                        label="To Section"
                        editSubAccountField="toSubAccount"
                        editSubAccountSectionField="toSection"
                        oppositeSubAccountField="fromSubAccount"
                        oppositeSubAccountSectionField="fromSection"
                    />

                    <CoinSelector
                        formik={formik}
                        subAccountsWithSections={subAccountsWithSections}
                        balancesByCoin={balancesByCoin}
                        convertRates={convertRates}
                        showLowBalanceCoins={showLowBalanceCoins}
                    />

                    <FormikForm.Item name="available" label="Available">
                        <Input
                            {...InternalTransfersTabTabProps[
                                EInternalTransfersTabSelectors.AvailableInput
                            ]}
                            className={cnAvailableReadonlyInput}
                            value={formattedBalance}
                            disabled
                            addonAfter={
                                <Button
                                    className={cnUseAllAvailableBalance}
                                    type="text"
                                    icon={<DoubleRightOutlined />}
                                    disabled={isNil(balance) || balance === 0}
                                    onClick={setAmountToAllAvailable}
                                />
                            }
                        />
                    </FormikForm.Item>

                    <FormikForm.Item
                        name="amount"
                        label={`Amount${isNil(values.coin) ? '' : `, ${values.coin}`}`}
                    >
                        <FormikInputNumber
                            {...InternalTransfersTabTabProps[
                                EInternalTransfersTabSelectors.AmountInput
                            ]}
                            name="amount"
                            disabled={isNil(values.coin)}
                            min={0}
                        />
                    </FormikForm.Item>

                    <FormikForm.Item name="percent" label="Percent">
                        <ReadonlyInputNumber
                            className={cnPercentageInput}
                            placeholder={formattedPercentage}
                            min={0}
                            disabled={isNil(balance) || balance === 0}
                            onChange={changePercentage}
                        />
                    </FormikForm.Item>

                    <FormikForm.Item className={cnFullWidth} name="submit">
                        <div className={cnActionsContainerWithOptions}>
                            <div className={cnLowBalanceOptionContainer}>
                                <SettingsSwitch
                                    {...InternalTransfersTabTabProps[
                                        EInternalTransfersTabSelectors.BalancesSwitch
                                    ]}
                                    label={`Show balances less then ${LOW_BALANCE_USD_AMOUNT}$`}
                                    checked={showLowBalanceCoins}
                                    onChange={onToggleShowLowBalanceCoins}
                                />
                            </div>
                            <div className={cnActionsContainerEx}>
                                <Button
                                    {...InternalTransfersTabTabProps[
                                        EInternalTransfersTabSelectors.ClearButton
                                    ]}
                                    className={cnActionButton}
                                    onClick={handleReset}
                                >
                                    Clear
                                </Button>
                                <Button
                                    {...InternalTransfersTabTabProps[
                                        EInternalTransfersTabSelectors.SendButton
                                    ]}
                                    className={cnActionButton}
                                    icon={
                                        isOutsideBounds ? (
                                            <WarningOutlined className={cnWarnColorIcon} />
                                        ) : undefined
                                    }
                                    htmlType="submit"
                                    type="primary"
                                    disabled={!isValid || requestTransferInProgress}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </FormikForm.Item>
                </div>
            </FormikForm>
        );
    },
);

import { WarningOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import {
    EManualTransferTabSelectors,
    ManualTransferTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/manual-transfer/manual-transfer.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Input } from '@frontend/common/src/components/Input';
import type {
    TAmount,
    TBalanceMonitorAccountId,
    TCoinConvertRate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';

import { CONVERSION_DIGITS } from '../../defs';
import { useCoinOptions } from '../../hooks/useCoinOptions';
import { DEFAULT_FILTER_OPTION, formatQuoteAmount } from '../../utils';
import { ReadonlyInputNumber } from '../components/ReadonlyInputNumber';
import {
    cnActionButton,
    cnFlexWrap,
    cnInputField,
    cnInputFieldAction,
    cnPercentageInput,
    cnRoot,
    cnWarnColorIcon,
} from '../view.css';
import { MinMaxTooltip } from './components/MinMaxTooltip';
import type { TManualTransferFormProps } from './defs';
import { useAmountPercentageEdit } from './hooks/useAmountPercentageEdit';
import { useAvailableAmounts } from './hooks/useAvailableAmounts';
import { useAvailableTransfers } from './hooks/useAvailableTransfers';
import { useCurrentTransfer } from './hooks/useCurrentTransfer';
import { useDestinationsOptions } from './hooks/useDestinationsOptions';
import { useSourcesOptions } from './hooks/useSourcesOptions';
import { resetFieldValue } from './utils';
import { INITIAL_VALUES } from './view';
import { cnAmountLabel } from './view.css';

export const ManualTransferForm = memo(
    ({
        formik,
        coinInfo,
        convertRates,
        requestTransferInProgress,
        disableCoinSelection,
        disableSourceSelection,
        disableDestinationSelection,
        disableAmountSelection,
        onFormReset,
    }: TWithFormik<Partial<TManualTransferFormProps>> & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        requestTransferInProgress: boolean;
        disableCoinSelection?: boolean;
        disableSourceSelection?: boolean;
        disableDestinationSelection?: boolean;
        disableAmountSelection?: boolean;
        onFormReset: VoidFunction;
    }) => {
        const { values, errors, isValid, validateForm, setTouched, setValues, setFieldValue } =
            formik;
        const coinsOptions = useCoinOptions(coinInfo);

        const transfers = useAvailableTransfers(values, coinInfo);

        const currentTransfer = useCurrentTransfer(transfers, values);

        const hasTransfer = useFunction(
            (source: TBalanceMonitorAccountId, destination: TBalanceMonitorAccountId): boolean =>
                transfers.some(
                    ({ from, to }) => from.account === source && to.account === destination,
                ),
        );

        const sourcesOptions = useSourcesOptions(transfers, values, hasTransfer);

        const destinationsOptions = useDestinationsOptions(transfers, values, hasTransfer);

        const disableCoin = useMemo(
            () => disableCoinSelection && isNil(errors.coin),
            [disableCoinSelection, errors],
        );
        const disableSource = useMemo(
            () => (disableSourceSelection && isNil(errors.from)) || isNil(values.coin),
            [disableSourceSelection, errors, values.coin],
        );
        const disableDestination = useMemo(
            () => (disableDestinationSelection && isNil(errors.to)) || isNil(values.coin),
            [disableDestinationSelection, errors, values.coin],
        );
        const disableAmount = useMemo(
            () => disableAmountSelection && isNil(errors.amount),
            [disableAmountSelection, errors],
        );

        const resetOnCoinChange = useFunction(() => {
            resetFieldValue(formik, 'from');
            resetFieldValue(formik, 'to');
            resetFieldValue(formik, 'amount');
            void validateForm();
        });

        const resetOnSourceChange = useFunction((account: TBalanceMonitorAccountId | undefined) => {
            resetFieldValue(formik, 'amount');

            if (
                isNil(values.to) ||
                isEmpty(values.to) ||
                isNil(account) ||
                isEmpty(account) ||
                hasTransfer(account, values.to)
            ) {
                return;
            }

            resetFieldValue(formik, 'to');
            void validateForm();
        });

        const resetOnDestinationChange = useFunction(
            (account: TBalanceMonitorAccountId | undefined) => {
                resetFieldValue(formik, 'amount');

                if (
                    isNil(values.from) ||
                    isEmpty(values.from) ||
                    isNil(account) ||
                    isEmpty(account) ||
                    hasTransfer(values.from, account)
                ) {
                    return;
                }

                resetFieldValue(formik, 'from');
                void validateForm();
            },
        );

        const handleReset = useFunction(() => {
            setTouched({}, false);
            setValues(INITIAL_VALUES, true);
            onFormReset();
        });

        useEffect(() => {
            void validateForm();
        }, [coinInfo, validateForm]);

        const isOutsideBounds = useMemo(() => {
            if (
                isNil(values.amount) ||
                isNil(currentTransfer) ||
                (isNil(currentTransfer.minManualTransfer) &&
                    isNil(currentTransfer.maxManualTransfer))
            ) {
                return false;
            }

            if (
                !isNil(currentTransfer.minManualTransfer) &&
                currentTransfer.minManualTransfer >= 0 &&
                values.amount < currentTransfer.minManualTransfer
            ) {
                return true;
            }

            if (
                !isNil(currentTransfer.maxManualTransfer) &&
                currentTransfer.maxManualTransfer >= 0 &&
                values.amount > currentTransfer.maxManualTransfer
            ) {
                return true;
            }

            return false;
        }, [values.amount, currentTransfer]);

        const { accountBalanceDisplay, accountPercentDisplay } = useAvailableAmounts(
            coinInfo,
            convertRates,
            values,
        );

        const amountTitle = useMemo(() => {
            if (isNil(values.amount) || isNil(values.coin)) {
                return 'Amount';
            }

            const amountUsd = formatQuoteAmount(
                values.amount,
                convertRates?.get(values.coin),
                CONVERSION_DIGITS,
            );

            if (isNil(amountUsd)) {
                return 'Amount';
            }

            return `Amount ~ ${amountUsd}`;
        }, [convertRates, values.amount, values.coin]);

        const { canEditPercentage, changePercentage } = useAmountPercentageEdit(
            values,
            coinInfo,
            formik,
        );

        const handleClickMinMax = useFunction((value: TAmount) => {
            setFieldValue('amount', value);
        });

        return (
            <FormikForm
                {...ManualTransferTabProps[EManualTransferTabSelectors.ManualTransferTab]}
                layout="vertical"
                className={cnRoot}
            >
                <FormikForm.Item className={cnInputField} name="coin" label="Coin">
                    <FormikSelect
                        {...ManualTransferTabProps[EManualTransferTabSelectors.CoinSelector]}
                        name="coin"
                        showSearch
                        disabled={disableCoin}
                        options={coinsOptions}
                        allowClear
                        onChange={resetOnCoinChange}
                        filterOption={DEFAULT_FILTER_OPTION}
                        optionLabelProp="label"
                    />
                </FormikForm.Item>
                <FormikForm.Item className={cnInputField} name="from" label="Source">
                    <FormikSelect
                        {...ManualTransferTabProps[EManualTransferTabSelectors.SourceSelector]}
                        name="from"
                        showSearch
                        disabled={disableSource}
                        options={sourcesOptions}
                        allowClear
                        onChange={resetOnSourceChange}
                        filterOption={DEFAULT_FILTER_OPTION}
                        optionLabelProp="label"
                    />
                </FormikForm.Item>
                <FormikForm.Item className={cnInputField} name="to" label="Destination">
                    <FormikSelect
                        {...ManualTransferTabProps[EManualTransferTabSelectors.DestinationSelector]}
                        name="to"
                        showSearch
                        disabled={disableDestination}
                        options={destinationsOptions}
                        allowClear
                        onChange={resetOnDestinationChange}
                        filterOption={DEFAULT_FILTER_OPTION}
                        optionLabelProp="label"
                    />
                </FormikForm.Item>

                <div className={cnFlexWrap} />

                <FormikForm.Item
                    className={cnInputField}
                    name="available"
                    label={`Available${isNil(values.coin) ? '' : ` ${values.coin}`}`}
                >
                    <Input
                        {...ManualTransferTabProps[EManualTransferTabSelectors.AvailableSelector]}
                        value={accountBalanceDisplay}
                        disabled
                    />
                </FormikForm.Item>

                <FormikForm.Item
                    className={cnInputField}
                    name="amount"
                    label={
                        <span className={cnAmountLabel}>
                            {amountTitle}
                            <MinMaxTooltip
                                currentTransfer={currentTransfer}
                                onClickNumber={handleClickMinMax}
                            />
                        </span>
                    }
                >
                    <FormikInputNumber
                        {...ManualTransferTabProps[EManualTransferTabSelectors.AmountInput]}
                        name="amount"
                        disabled={disableAmount}
                        min={0}
                    />
                </FormikForm.Item>

                <FormikForm.Item className={cnInputField} name="percent" label="Percent">
                    <ReadonlyInputNumber
                        {...ManualTransferTabProps[EManualTransferTabSelectors.PercentInput]}
                        className={cnPercentageInput}
                        placeholder={accountPercentDisplay}
                        min={0}
                        disabled={!canEditPercentage}
                        onChange={changePercentage}
                    />
                </FormikForm.Item>

                <div className={cnFlexWrap} />

                <FormikForm.Item name="submit" className={cnInputFieldAction}>
                    <Button
                        {...ManualTransferTabProps[EManualTransferTabSelectors.ClearButton]}
                        className={cnActionButton}
                        onClick={handleReset}
                    >
                        Clear
                    </Button>
                    <Button
                        {...ManualTransferTabProps[EManualTransferTabSelectors.SendButton]}
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
                </FormikForm.Item>
            </FormikForm>
        );
    },
);

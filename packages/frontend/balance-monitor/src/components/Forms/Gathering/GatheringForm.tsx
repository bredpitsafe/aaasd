import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import type {
    TCoinId,
    TExchangeId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import type { TConvertRatesDescriptor } from '../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { cnActionButton, cnFlexWrap, cnInputField, cnInputFieldAction, cnRoot } from '../view.css';
import { AmountInput } from './components/AmountInput';
import { AvailableExchange } from './components/AvailableExchange';
import { CoinSelector } from './components/CoinSelector';
import { ExchangeSelector } from './components/ExchangeSelector';
import { PercentInput } from './components/PercentInput';
import type { TGatheringFormProps } from './defs';
export const GatheringForm = memo(
    ({
        formik,
        exchanges,
        coinInfo,
        convertRatesDescriptor,
        actionInProgress,
        onStopGathering,
        onResetForm,
    }: TWithFormik<Partial<TGatheringFormProps>> & {
        exchanges: TExchangeId[];
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        convertRatesDescriptor: TConvertRatesDescriptor;
        actionInProgress: boolean;
        onStopGathering: (exchange: TExchangeId, coin: TCoinId) => Promise<boolean>;
        onResetForm: (formikHelpers: FormikHelpers<Partial<TGatheringFormProps>>) => void;
    }) => {
        const handleReset = useFunction(() => onResetForm(formik));

        const handleStopGathering = useFunction(async () => {
            const {
                values: { exchange, coin },
            } = formik;

            if (isNil(exchange) || isNil(coin)) {
                return;
            }

            if (await onStopGathering(exchange, coin)) {
                handleReset();
            }
        });

        return (
            <FormikForm
                {...GatheringTabProps[EGatheringTabSelectors.GatheringTab]}
                layout="vertical"
                className={cnRoot}
            >
                <ExchangeSelector className={cnInputField} formik={formik} exchanges={exchanges} />
                <CoinSelector className={cnInputField} formik={formik} coinInfo={coinInfo} />

                <div className={cnFlexWrap} />

                <AvailableExchange
                    className={cnInputField}
                    formik={formik}
                    coinInfo={coinInfo}
                    convertRatesDescriptor={convertRatesDescriptor}
                />
                <AmountInput
                    className={cnInputField}
                    formik={formik}
                    convertRatesDescriptor={convertRatesDescriptor}
                />
                <PercentInput
                    {...GatheringTabProps[EGatheringTabSelectors.PercentInput]}
                    className={cnInputField}
                    formik={formik}
                    coinInfo={coinInfo}
                />

                <div className={cnFlexWrap} />

                <FormikForm.Item className={cnInputFieldAction} name="submit">
                    <Button
                        {...GatheringTabProps[EGatheringTabSelectors.ClearButton]}
                        className={cnActionButton}
                        disabled={actionInProgress}
                        onClick={handleReset}
                    >
                        Clear
                    </Button>
                    <Button
                        {...GatheringTabProps[EGatheringTabSelectors.StopCollectingButton]}
                        className={cnActionButton}
                        disabled={
                            isNil(formik.values.exchange) ||
                            isNil(formik.values.coin) ||
                            actionInProgress
                        }
                        onClick={handleStopGathering}
                    >
                        Stop collecting
                    </Button>
                    <Button
                        {...GatheringTabProps[EGatheringTabSelectors.CollectButton]}
                        className={cnActionButton}
                        htmlType="submit"
                        type="primary"
                        disabled={!formik.isValid || actionInProgress}
                    >
                        Collect {isNil(formik.values.coin) ? 'coin' : formik.values.coin} on MAIN
                    </Button>
                </FormikForm.Item>
            </FormikForm>
        );
    },
);

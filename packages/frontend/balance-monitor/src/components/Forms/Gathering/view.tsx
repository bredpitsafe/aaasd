import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import type {
    TAmount,
    TCoinId,
    TExchangeId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo } from 'react';
import * as Yup from 'yup';

import type { TConvertRatesDescriptor } from '../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TGatheringFormProps } from './defs';
import { GatheringForm } from './GatheringForm';
import { getCoins } from './utils';

const SCHEMA = Yup.object().shape({
    exchange: Yup.string().required('Required'),
    coin: Yup.string().required('Required'),
    amount: Yup.number()
        .nullable(true)
        .required('Required')
        .moreThan(0, 'Amount should be greater then 0'),
});

const INITIAL_VALUES: Partial<TGatheringFormProps> = {
    exchange: undefined,
    coin: undefined,
    amount: undefined,
};

export const Gathering = memo(
    ({
        exchanges,
        coinInfo,
        convertRatesDescriptor,
        actionInProgress,
        onStartGathering,
        onStopGathering,
    }: {
        exchanges: TExchangeId[];
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        convertRatesDescriptor: TConvertRatesDescriptor;
        onStartGathering: (
            exchange: TExchangeId,
            coin: TCoinId,
            amount: TAmount,
        ) => Promise<boolean>;
        onStopGathering: (exchange: TExchangeId, coin: TCoinId) => Promise<boolean>;
        actionInProgress: boolean;
    }) => {
        const handleReset = useFunction(
            ({ setTouched, setValues }: FormikHelpers<Partial<TGatheringFormProps>>) => {
                setTouched({}, false);

                const exchange = exchanges.length === 1 ? exchanges[0] : undefined;
                const coins = isNil(exchange) ? [] : getCoins(exchange, coinInfo);

                setValues(
                    {
                        exchange,
                        coin: coins.length === 1 ? coins[0] : undefined,
                    },
                    true,
                );
            },
        );

        const handleSubmit = useFunction(
            async (
                formValues: Partial<TGatheringFormProps>,
                formikHelpers: FormikHelpers<Partial<TGatheringFormProps>>,
            ) => {
                if (
                    isNil(formValues.exchange) ||
                    isNil(formValues.coin) ||
                    isNil(formValues.amount)
                ) {
                    return;
                }

                const result = await onStartGathering(
                    formValues.exchange,
                    formValues.coin,
                    formValues.amount,
                );

                if (result) {
                    handleReset(formikHelpers);
                }
            },
        );

        return (
            <Formik<Partial<TGatheringFormProps>>
                enableReinitialize
                initialValues={INITIAL_VALUES}
                validationSchema={SCHEMA}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => (
                    <GatheringForm
                        {...GatheringTabProps[EGatheringTabSelectors.GatheringTab]}
                        formik={formik}
                        exchanges={exchanges}
                        coinInfo={coinInfo}
                        convertRatesDescriptor={convertRatesDescriptor}
                        actionInProgress={actionInProgress}
                        onStopGathering={onStopGathering}
                        onResetForm={handleReset}
                    />
                )}
            </Formik>
        );
    },
);

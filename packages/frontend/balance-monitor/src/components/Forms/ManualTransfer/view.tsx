import type { Nil } from '@common/types';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    type TCoinConvertRate,
    ETransferKind,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import * as Yup from 'yup';

import type { TConfirmationTransferAction } from '../../../widgets/WidgetTransferConfirmation/defs';
import { getNetworksFromTransfers } from '../../utils';
import { useCoinValidation } from '../hooks/useCoinValidation';
import type { TManualTransferFormData, TManualTransferFormProps } from './defs';
import { useDestinationAccountValidation } from './hooks/useDestinationAccountValidation';
import { useSourceAccountValidation } from './hooks/useSourceAccountValidation';
import { ManualTransferForm } from './ManualTransferForm';

export const INITIAL_VALUES: Partial<TManualTransferFormProps> = {};

export const ManualTransfer = memo(
    ({
        manualTransfer,
        coinInfo,
        convertRates,
        requestTransferInProgress,
        onRequestTransfer,
        onFormReset,
    }: {
        manualTransfer?: TManualTransferFormData;
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        onRequestTransfer: (props: TConfirmationTransferAction) => Promise<boolean>;
        onFormReset: VoidFunction;
        requestTransferInProgress: boolean;
    }) => {
        const initialValues = useMemo<Partial<TManualTransferFormProps>>(
            () =>
                isNil(manualTransfer)
                    ? INITIAL_VALUES
                    : {
                          coin: manualTransfer.coin,
                          from: manualTransfer.from,
                          to: manualTransfer.to,
                          amount: manualTransfer.amount,
                      },
            [manualTransfer],
        );

        const coinFieldValidator = useCoinValidation(coinInfo);
        const fromFieldValidator = useSourceAccountValidation(coinInfo);
        const toFieldValidator = useDestinationAccountValidation(coinInfo);

        const schema = useMemo(
            () =>
                Yup.object().shape({
                    coin: Yup.string()
                        .required('Required')
                        .test('is-valid-coin', `Coin is not available`, coinFieldValidator),
                    from: Yup.string()
                        .required('Required')
                        .when(['coin', 'to'], fromFieldValidator),
                    to: Yup.string().required('Required').when(['coin'], toFieldValidator),
                    amount: Yup.number()
                        .nullable(true)
                        .required('Required')
                        .moreThan(0, 'Amount should be greater then 0'),
                }),
            [coinFieldValidator, fromFieldValidator, toFieldValidator],
        );

        const handleSubmit = useFunction(
            async (
                formValues: Partial<TManualTransferFormProps>,
                { setTouched, setValues }: FormikHelpers<Partial<TManualTransferFormProps>>,
            ) => {
                if (
                    isNil(formValues.coin) ||
                    isNil(formValues.from) ||
                    isNil(formValues.to) ||
                    isNil(formValues.amount)
                ) {
                    return;
                }

                const matchTransfers = coinInfo
                    .get(formValues.coin)
                    ?.graph.possibleTransfers.filter(
                        ({ isManualEnabled, from, to }) =>
                            isManualEnabled &&
                            from.account === formValues.from &&
                            to.account === formValues.to,
                    );

                const result = await onRequestTransfer({
                    coin: formValues.coin,
                    from: formValues.from,
                    fromExchange: matchTransfers?.[0]?.from.exchange,
                    to: formValues.to,
                    toExchange: matchTransfers?.[0]?.to.exchange,
                    amount: formValues.amount,
                    kind: ETransferKind.Manual,
                    networks: isNil(matchTransfers)
                        ? undefined
                        : getNetworksFromTransfers(matchTransfers),
                });

                if (result) {
                    onFormReset();
                    setTouched({}, false);
                    setValues(INITIAL_VALUES, true);
                }
            },
        );

        const initialTouched = useMemo(
            () =>
                isNil(manualTransfer)
                    ? {}
                    : {
                          coin: !isNil(manualTransfer.coin),
                          from: !isNil(manualTransfer.from),
                          to: !isNil(manualTransfer.to),
                          amount: !isNil(manualTransfer.amount),
                      },
            [manualTransfer],
        );

        return (
            <Formik<Partial<TManualTransferFormProps>>
                enableReinitialize
                initialValues={initialValues}
                initialTouched={initialTouched}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => (
                    <ManualTransferForm
                        formik={formik}
                        coinInfo={coinInfo}
                        convertRates={convertRates}
                        requestTransferInProgress={requestTransferInProgress}
                        disableCoinSelection={manualTransfer?.disableCoinSelection}
                        disableSourceSelection={manualTransfer?.disableSourceSelection}
                        disableDestinationSelection={manualTransfer?.disableDestinationSelection}
                        disableAmountSelection={manualTransfer?.disableAmountSelection}
                        onFormReset={onFormReset}
                    />
                )}
            </Formik>
        );
    },
);

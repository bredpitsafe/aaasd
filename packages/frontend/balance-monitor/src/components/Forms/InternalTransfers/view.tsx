import type { Nil } from '@common/types';
import type {
    TCoinConvertRate,
    TCoinId,
    TInternalTransferAction,
    TPossibleInternalTransfer,
    TSubAccountBalance,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TInternalTransferFormProps } from './defs';
import { useSchema } from './hooks/useSchema';
import { InternalTransferForm } from './InternalTransferForm';

export const INITIAL_VALUES: Partial<TInternalTransferFormProps> = {};

export const InternalTransfer = memo(
    ({
        convertRates,
        internalTransfer,
        internalTransferInfo,
        internalSubAccountBalances,
        requestTransferInProgress,
        onRequestTransfer,
        onFormReset,
        showLowBalanceCoins,
        onToggleShowLowBalanceCoins,
    }: {
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        internalTransfer?: TInternalTransferFormProps;
        internalTransferInfo: TPossibleInternalTransfer[];
        internalSubAccountBalances: TSubAccountBalance[];
        onRequestTransfer: (props: TInternalTransferAction) => Promise<boolean>;
        onFormReset: VoidFunction;
        requestTransferInProgress: boolean;
        showLowBalanceCoins: boolean;
        onToggleShowLowBalanceCoins: (value?: boolean) => void;
    }) => {
        const initialValues = useMemo<Partial<TInternalTransferFormProps>>(
            () =>
                isNil(internalTransfer)
                    ? INITIAL_VALUES
                    : {
                          mainAccount: internalTransfer.mainAccount,
                          fromSubAccount: internalTransfer.fromSubAccount,
                          fromSection: internalTransfer.fromSection,
                          toSubAccount: internalTransfer.toSubAccount,
                          toSection: internalTransfer.toSection,
                          coin: internalTransfer.coin,
                          amount: internalTransfer.amount,
                      },
            [internalTransfer],
        );

        const handleSubmit = useFunction(
            async (
                formValues: Partial<TInternalTransferFormProps>,
                { setTouched, setValues }: FormikHelpers<Partial<TInternalTransferFormProps>>,
            ) => {
                if (
                    isNil(formValues.mainAccount) ||
                    isNil(formValues.fromSubAccount) ||
                    isNil(formValues.fromSection) ||
                    isNil(formValues.toSubAccount) ||
                    isNil(formValues.toSection) ||
                    isNil(formValues.coin) ||
                    isNil(formValues.amount)
                ) {
                    return;
                }

                const result = await onRequestTransfer({
                    mainAccount: formValues.mainAccount,
                    from: {
                        name: formValues.fromSubAccount,
                        section: formValues.fromSection,
                    },
                    to: {
                        name: formValues.toSubAccount,
                        section: formValues.toSection,
                    },
                    coin: formValues.coin,
                    amount: formValues.amount,
                });

                if (result) {
                    onFormReset();
                    setTouched({}, false);
                    setValues(INITIAL_VALUES, true);
                }
            },
        );

        const schema = useSchema(internalTransferInfo);

        return (
            <Formik<Partial<TInternalTransferFormProps>>
                enableReinitialize
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => (
                    <InternalTransferForm
                        formik={formik}
                        convertRates={convertRates}
                        possibleInternalTransfers={internalTransferInfo}
                        internalSubAccountBalances={internalSubAccountBalances}
                        requestTransferInProgress={requestTransferInProgress}
                        showLowBalanceCoins={showLowBalanceCoins}
                        onToggleShowLowBalanceCoins={onToggleShowLowBalanceCoins}
                        onFormReset={onFormReset}
                    />
                )}
            </Formik>
        );
    },
);

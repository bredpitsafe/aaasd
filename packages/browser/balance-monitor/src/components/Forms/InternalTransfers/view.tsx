import type {
    TInternalTransferAction,
    TPossibleInternalTransfer,
    TSubAccountBalance,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import type { TConvertRatesDescriptor } from '../../../modules/observables/ModuleConvertRates';
import type { TInternalTransferFormProps } from './defs';
import { useSchema } from './hooks/useSchema';
import { InternalTransferForm } from './InternalTransferForm';

export const INITIAL_VALUES: Partial<TInternalTransferFormProps> = {};

export const InternalTransfer = memo(
    ({
        internalTransferInfo,
        internalSubAccountBalances,
        convertRatesDescriptor,
        requestTransferInProgress,
        onRequestTransfer,
        showLowBalanceCoins,
        onToggleShowLowBalanceCoins,
    }: {
        internalTransferInfo: TPossibleInternalTransfer[];
        internalSubAccountBalances: TSubAccountBalance[];
        convertRatesDescriptor: TConvertRatesDescriptor;
        onRequestTransfer: (props: TInternalTransferAction) => Promise<boolean>;
        requestTransferInProgress: boolean;
        showLowBalanceCoins: boolean;
        onToggleShowLowBalanceCoins: (value?: boolean) => void;
    }) => {
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
                    setTouched({}, false);
                    setValues(INITIAL_VALUES, true);
                }
            },
        );

        const schema = useSchema(internalTransferInfo);

        return (
            <Formik<Partial<TInternalTransferFormProps>>
                enableReinitialize
                initialValues={INITIAL_VALUES}
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => (
                    <InternalTransferForm
                        formik={formik}
                        possibleInternalTransfers={internalTransferInfo}
                        internalSubAccountBalances={internalSubAccountBalances}
                        convertRates={
                            isSyncDesc(convertRatesDescriptor)
                                ? convertRatesDescriptor.value
                                : undefined
                        }
                        requestTransferInProgress={requestTransferInProgress}
                        showLowBalanceCoins={showLowBalanceCoins}
                        onToggleShowLowBalanceCoins={onToggleShowLowBalanceCoins}
                    />
                )}
            </Formik>
        );
    },
);

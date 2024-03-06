import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import * as Yup from 'yup';

import { useCoinValidation } from '../hooks/useCoinValidation';
import type { TSaveCoinStateFormValues } from './defs';
import { SendDataToAnalyzeForm } from './SendDataToAnalyzeForm';

export const SendDataToAnalyse = memo(
    ({
        coinInfo,
        onSaveCoinState,
    }: {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        onSaveCoinState: (coin: TCoinId, comment: string) => Promise<boolean>;
    }) => {
        const initialValues = useMemo<Partial<TSaveCoinStateFormValues>>(
            () => ({
                coin: undefined,
                comment: undefined,
            }),
            [],
        );

        const coinFieldValidator = useCoinValidation(coinInfo);

        const schema = useMemo(
            () =>
                Yup.object().shape({
                    coin: Yup.string()
                        .required('Required')
                        .test('is-valid-coin', `Coin is not available`, coinFieldValidator),
                    comment: Yup.string().required('Required'),
                }),
            [coinFieldValidator],
        );

        const handleSubmit = useFunction(
            async (
                formValues: Partial<TSaveCoinStateFormValues>,
                formikHelpers: FormikHelpers<Partial<TSaveCoinStateFormValues>>,
            ) => {
                if (isNil(formValues.coin) || isNil(formValues.comment)) {
                    return;
                }

                if (await onSaveCoinState(formValues.coin, formValues.comment)) {
                    formikHelpers.resetForm();
                }
            },
        );

        return (
            <Formik<Partial<TSaveCoinStateFormValues>>
                initialValues={initialValues}
                enableReinitialize
                validationSchema={schema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {(formik) => <SendDataToAnalyzeForm formik={formik} coinInfo={coinInfo} />}
            </Formik>
        );
    },
);

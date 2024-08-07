import {
    ESendDataToAnalyseTabSelectors,
    SendDataToAnalyseTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/send-data-to-analyse/send-data.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { memo, useEffect } from 'react';

import { useCoinOptions } from '../../hooks/useCoinOptions';
import { DEFAULT_FILTER_OPTION } from '../../utils';
import { cnActionButton, cnInputField, cnInputFieldAction, cnRoot } from '../view.css';
import type { TSaveCoinStateFormValues } from './defs';
import { cnTextAreaField } from './view.css';

export const SendDataToAnalyzeForm = memo(
    ({
        formik,
        coinInfo,
    }: TWithFormik<Partial<TSaveCoinStateFormValues>> & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
    }) => {
        const { isValid, validateForm, resetForm } = formik;
        const coinsOptions = useCoinOptions(coinInfo);

        const handleReset = useFunction(() => {
            resetForm();
            void validateForm();
        });

        useEffect(() => {
            void validateForm();
        }, [coinInfo, validateForm]);

        return (
            <FormikForm
                {...SendDataToAnalyseTabProps[ESendDataToAnalyseTabSelectors.SendDataTab]}
                layout="vertical"
                className={cnRoot}
            >
                <FormikForm.Item className={cnInputField} name="coin" label="Coin">
                    <FormikSelect
                        {...SendDataToAnalyseTabProps[ESendDataToAnalyseTabSelectors.CoinSelector]}
                        name="coin"
                        showSearch
                        options={coinsOptions}
                        allowClear
                        filterOption={DEFAULT_FILTER_OPTION}
                    />
                </FormikForm.Item>

                <FormikForm.Item className={cnTextAreaField} name="comment" label="Comment">
                    <FormikInput.TextArea
                        {...SendDataToAnalyseTabProps[ESendDataToAnalyseTabSelectors.CommentInput]}
                        name="comment"
                        allowClear
                    />
                </FormikForm.Item>

                <FormikForm.Item labelAlign="left" name="submit" className={cnInputFieldAction}>
                    <Button
                        {...SendDataToAnalyseTabProps[ESendDataToAnalyseTabSelectors.ClearButton]}
                        className={cnActionButton}
                        onClick={handleReset}
                    >
                        Clear
                    </Button>
                    <Button
                        {...SendDataToAnalyseTabProps[ESendDataToAnalyseTabSelectors.SendButton]}
                        className={cnActionButton}
                        htmlType="submit"
                        type="primary"
                        disabled={!isValid}
                    >
                        Send
                    </Button>
                </FormikForm.Item>
            </FormikForm>
        );
    },
);

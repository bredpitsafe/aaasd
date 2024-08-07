import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { clamp, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { PERCENTAGE_DIGITS } from '../../../defs';
import { formattedPercentOrEmpty, getPercentageValue, getPercentOrEmpty } from '../../../utils';
import { ReadonlyInputNumber } from '../../components/ReadonlyInputNumber';
import { cnPercentageInput } from '../../view.css';
import type { TGatheringFormProps } from '../defs';
import { MANUAL_EDIT_AMOUNT_DIGITS } from '../defs';
import { getExchangeBalance } from '../utils';

export const PercentInput = memo(
    ({
        className,
        formik: {
            values: { coin, exchange, amount },
            setFieldValue,
        },
        coinInfo,
    }: TWithClassname &
        TWithFormik<Partial<TGatheringFormProps>> & {
            coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        }) => {
        const balance = useMemo(
            () =>
                isNil(coin) || isNil(exchange)
                    ? undefined
                    : getExchangeBalance(exchange, coin, coinInfo),
            [coin, coinInfo, exchange],
        );

        const accountPercentDisplay = useMemo(() => {
            if (isNil(balance)) {
                return '';
            }

            return formattedPercentOrEmpty(getPercentOrEmpty(amount, balance), PERCENTAGE_DIGITS);
        }, [balance, amount]);

        const changePercentage = useFunction((percentage: number | null) => {
            if (isNil(percentage) || isNil(balance)) {
                return;
            }

            const amount = getPercentageValue(
                balance,
                clamp(percentage, 0, 100),
                MANUAL_EDIT_AMOUNT_DIGITS,
            );

            setFieldValue('amount', amount, true);
        });

        return (
            <FormikForm.Item className={className} name="percent" label="Percent">
                <ReadonlyInputNumber
                    className={cnPercentageInput}
                    placeholder={accountPercentDisplay}
                    min={0}
                    disabled={isNil(balance) || balance === 0}
                    onChange={changePercentage}
                />
            </FormikForm.Item>
        );
    },
);

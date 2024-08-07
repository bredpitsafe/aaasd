import {
    EGatheringTabSelectors,
    GatheringTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/gathering/gathering.page.selectors';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { Input } from '@frontend/common/src/components/Input';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TConvertRatesDescriptor } from '../../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { CONVERSION_DIGITS } from '../../../defs';
import { formatAmountOrEmptyWithConversionRate } from '../../../utils';
import type { TGatheringFormProps } from '../defs';
import { MANUAL_EDIT_AMOUNT_DIGITS } from '../defs';
import { getExchangeBalance } from '../utils';

export const AvailableExchange = memo(
    ({
        className,
        formik: {
            values: { coin, exchange },
        },
        coinInfo,
        convertRatesDescriptor,
    }: TWithClassname &
        TWithFormik<Partial<TGatheringFormProps>> & {
            coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
            convertRatesDescriptor: TConvertRatesDescriptor;
        }) => {
        const balance = useMemo(
            () =>
                isNil(coin) || isNil(exchange)
                    ? undefined
                    : getExchangeBalance(exchange, coin, coinInfo),
            [coin, coinInfo, exchange],
        );

        const accountBalanceDisplay = useMemo(() => {
            if (isNil(balance) || isNil(coin)) {
                return '';
            }

            return formatAmountOrEmptyWithConversionRate(
                balance,
                isSyncedValueDescriptor(convertRatesDescriptor)
                    ? convertRatesDescriptor.value.get(coin)
                    : undefined,
                MANUAL_EDIT_AMOUNT_DIGITS,
                CONVERSION_DIGITS,
            );
        }, [balance, coin, convertRatesDescriptor]);

        return (
            <FormikForm.Item
                className={className}
                name="available"
                label={`Available${isNil(coin) ? '' : ` ${coin} on exchange`}`}
            >
                <Input
                    {...GatheringTabProps[EGatheringTabSelectors.AvailableInput]}
                    value={accountBalanceDisplay}
                    disabled
                />
            </FormikForm.Item>
        );
    },
);

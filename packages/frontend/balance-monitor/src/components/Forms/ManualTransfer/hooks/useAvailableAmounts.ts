import type { Nil } from '@common/types';
import type {
    TCoinConvertRate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { CONVERSION_DIGITS, PERCENTAGE_DIGITS } from '../../../defs';
import {
    formatAmountOrEmptyWithConversionRate,
    formattedPercentOrEmpty,
    getPercentOrEmpty,
} from '../../../utils';
import type { TManualTransferFormProps } from '../defs';
import { MANUAL_EDIT_AMOUNT_DIGITS } from '../defs';

export function useAvailableAmounts(
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
    convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate> | undefined,
    values: Partial<TManualTransferFormProps>,
): {
    accountBalanceDisplay?: string;
    accountPercentDisplay?: string;
} {
    const fullInfoByCoin = useMemo(
        () => (isNil(values.coin) ? undefined : coinInfo.get(values.coin)),
        [values.coin, coinInfo],
    );

    return useMemo(() => {
        if (isNil(fullInfoByCoin) || isNil(values.from)) {
            return {};
        }

        const balance = fullInfoByCoin.accountBalances[values.from];

        if (isNil(balance)) {
            return {};
        }

        return {
            accountBalanceDisplay: formatAmountOrEmptyWithConversionRate(
                balance,
                isNil(values.coin) ? undefined : convertRates?.get(values.coin),
                MANUAL_EDIT_AMOUNT_DIGITS,
                CONVERSION_DIGITS,
            ),
            accountPercentDisplay: formattedPercentOrEmpty(
                getPercentOrEmpty(values.amount, balance),
                PERCENTAGE_DIGITS,
            ),
        };
    }, [fullInfoByCoin, values.from, values.coin, values.amount, convertRates]);
}

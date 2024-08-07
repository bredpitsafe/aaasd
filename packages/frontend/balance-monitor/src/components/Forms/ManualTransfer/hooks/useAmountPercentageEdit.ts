import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikHelpers } from 'formik/dist/types';
import { clamp, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { getPercentageValue } from '../../../utils';
import type { TManualTransferFormProps } from '../defs';
import { MANUAL_EDIT_AMOUNT_DIGITS } from '../defs';

export function useAmountPercentageEdit(
    values: Partial<TManualTransferFormProps>,
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
    formik: FormikHelpers<Partial<TManualTransferFormProps>>,
): {
    canEditPercentage: boolean;
    changePercentage: (percentage: number | null) => void;
} {
    const accountBalance = useMemo(
        () =>
            isNil(values.coin) || isNil(values.from)
                ? undefined
                : coinInfo.get(values.coin)?.accountBalances?.[values.from],

        [values.coin, values.from, coinInfo],
    );

    const changePercentage = useFunction((percentage: number | null) => {
        if (isNil(percentage) || isNil(accountBalance)) {
            return;
        }

        const amount = getPercentageValue(
            accountBalance,
            clamp(percentage, 0, 100),
            MANUAL_EDIT_AMOUNT_DIGITS,
        );

        formik.setFieldValue('amount', amount, true);
    });

    return { canEditPercentage: !isNil(accountBalance) && accountBalance !== 0, changePercentage };
}

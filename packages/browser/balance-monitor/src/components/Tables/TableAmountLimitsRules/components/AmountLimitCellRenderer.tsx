import type {
    TAmount,
    TAmountLimitsRuleInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, useContext } from 'react';

import { AmountWithUsdAmount } from '../../../AmountWithUsdAmount';
import { useShowCoinIcons } from '../../../Settings/hooks/useShowCoinIcons';
import { ConvertRatesContext } from './ConvertRatesContext';

export const AmountLimitCellRenderer = memo(
    forwardRef(
        (
            {
                value: amount,
                data,
            }: ICellRendererParams<TAmountLimitsRuleInfo, TAmount | undefined>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const convertRates = useContext(ConvertRatesContext);
            const [showIcon] = useShowCoinIcons();

            if (isNil(data)) {
                return null;
            }

            return (
                <AmountWithUsdAmount
                    ref={ref}
                    amount={amount}
                    coin={data.amountCurrency}
                    convertRate={convertRates?.get(data.amountCurrency)}
                    showIcon={showIcon}
                />
            );
        },
    ),
);

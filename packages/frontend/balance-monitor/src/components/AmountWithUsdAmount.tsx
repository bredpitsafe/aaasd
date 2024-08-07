import type {
    TAmount,
    TCoinConvertRate,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef, Ref } from 'react';
import { forwardRef, memo } from 'react';

import { CoinWithIcon } from './CoinWithIcon';
import { CONVERSION_DIGITS } from './defs';
import { cnAmount, cnAmountContainer, cnAmountUsd } from './style.css';
import { formatAmountOrEmpty, formatQuoteAmount } from './utils';

export const AmountWithUsdAmount = memo(
    forwardRef(
        (
            {
                amount,
                coin,
                convertRate,
                showIcon = true,
            }: {
                amount: TAmount | null | undefined;
                coin: TCoinId;
                convertRate: TCoinConvertRate | undefined;
                showIcon?: boolean;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => (
            <div className={cnAmountContainer} ref={ref as Ref<HTMLDivElement>}>
                <span className={cnAmount}>{formatAmountOrEmpty(amount)}</span>
                {!isNil(amount) && (
                    <>
                        <CoinWithIcon coin={coin} showIcon={showIcon} />
                        {convertRate !== undefined && (
                            <span className={cnAmountUsd}>
                                ({formatQuoteAmount(amount, convertRate, CONVERSION_DIGITS)})
                            </span>
                        )}
                    </>
                )}
            </div>
        ),
    ),
);

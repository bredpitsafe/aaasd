import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import { useMaxDecimalNumberFormatter } from '../hooks/useMaxDecimalNumberFormatter';
import { styleAmountChange, styleNegative, stylePositive, stylePricePad } from './style.css';

export const ValueChange = memo(
    ({
        currentAmount,
        nextAmount,
        amountChanges,
    }: {
        currentAmount: TBidAskItem['amount'];
        nextAmount: TBidAskItem['amount'];
        amountChanges: TBidAskItem['amount'][];
    }) => {
        const amountChange = nextAmount - currentAmount;

        const formattedAmountChange = useMaxDecimalNumberFormatter(
            amountChange !== 0 ? amountChange : undefined,
            amountChanges,
        );

        if (isNil(formattedAmountChange)) {
            return <div className={styleAmountChange} />;
        }

        return (
            <div
                className={cn(styleAmountChange, {
                    [styleNegative]: amountChange < 0,
                    [stylePositive]: amountChange > 0,
                })}
            >
                {amountChange > 0 ? '+' : ''}
                {formattedAmountChange.display}
                {!isEmpty(formattedAmountChange.postfix) && (
                    <span className={stylePricePad}>{formattedAmountChange.postfix}</span>
                )}
            </div>
        );
    },
);

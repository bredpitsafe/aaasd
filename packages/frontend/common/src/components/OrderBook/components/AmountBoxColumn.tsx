import cn from 'classnames';
import { memo, useMemo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../../types/components';
import { EBidAsk } from '../defs';
import { styleAmountBoxColumn, styleBox, styleBoxAsk, styleBoxBid } from './style.css';

export const AmountBoxColumn = memo(
    ({
        className,
        bidAskType,
        amount,
        amounts,
    }: {
        className: string;
        bidAskType: EBidAsk;
        amount: TBidAskItem['amount'];
        amounts: TBidAskItem['amount'][];
    } & TWithClassname) => {
        const maxAmount = useMemo(() => Math.max(0, ...amounts), [amounts]);

        const shouldRender = amount > 0 && maxAmount > 0;

        const colorClass = useMemo(() => getBidAskStyle(bidAskType), [bidAskType]);

        const shapeStyle = useMemo(
            () =>
                shouldRender && maxAmount > 0
                    ? { flexBasis: `${((amount / maxAmount) * 100).toFixed(2)}%` }
                    : undefined,
            [shouldRender, amount, maxAmount],
        );

        return (
            <div className={cn(styleAmountBoxColumn, className)}>
                {shouldRender && <div className={cn(styleBox, colorClass)} style={shapeStyle} />}
            </div>
        );
    },
);

function getBidAskStyle(bidAskType: EBidAsk): undefined | string {
    switch (bidAskType) {
        case EBidAsk.Ask:
            return styleBoxAsk;
        case EBidAsk.Bid:
            return styleBoxBid;
        default:
            return undefined;
    }
}

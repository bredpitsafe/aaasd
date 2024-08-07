import cn from 'classnames';
import { memo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../../types/components';
import { styleAmountChangeColumn } from './style.css';
import { ValueChange } from './ValueChange';

export const AmountChangeColumn = memo(
    ({
        className,
        currentAmount,
        nextAmount,
        amountChanges,
        feed,
    }: {
        currentAmount: TBidAskItem['amount'];
        nextAmount: TBidAskItem['amount'];
        amountChanges: TBidAskItem['amount'][];
        feed?: TBidAskItem['feed'] | [TBidAskItem['feed'], TBidAskItem['feed']];
    } & TWithClassname) => (
        <div className={cn(styleAmountChangeColumn, className)}>
            <ValueChange
                currentAmount={currentAmount}
                nextAmount={Array.isArray(feed) ? 0 : nextAmount}
                amountChanges={amountChanges}
            />
        </div>
    ),
);

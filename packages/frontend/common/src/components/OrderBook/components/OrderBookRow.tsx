import { memo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TOrderBookItem } from '../defs';
import { AmountBoxColumn } from './AmountBoxColumn';
import { AmountChangeColumn } from './AmountChangeColumn';
import { AmountColumn } from './AmountColumn';
import { FeedWithAmountChangeColumn } from './FeedWithAmountChangeColumn';
import { PriceColumn } from './PriceColumn';
import {
    styleColumn1,
    styleColumn2,
    styleColumn3,
    styleColumn4,
    styleColumn5,
    styleColumn6,
    styleColumn7,
    styleColumn8,
    styleGridRow,
} from './style.css';

export const OrderBookRow = memo(
    ({
        item,
        prices,
        currentAmounts,
        nextAmounts,
        amountChanges,
    }: {
        item: TOrderBookItem;
        prices: TOrderBookItem['price'][];
        currentAmounts: TBidAskItem['amount'][];
        nextAmounts: TBidAskItem['amount'][];
        amountChanges: TBidAskItem['amount'][];
    }) => {
        const sign = Math.sign(item.nextAmount - item.currentAmount);

        return (
            <div className={styleGridRow}>
                <PriceColumn className={styleColumn1} price={item.price} prices={prices} />
                <AmountColumn
                    className={styleColumn2}
                    amount={item.currentAmount}
                    amounts={currentAmounts}
                />
                <AmountBoxColumn
                    className={styleColumn3}
                    bidAskType={item.currentBidAskType}
                    amount={item.currentAmount}
                    amounts={currentAmounts}
                />

                <PriceColumn className={styleColumn4} price={item.price} prices={prices} />
                <AmountColumn
                    className={styleColumn5}
                    amount={item.nextAmount}
                    amounts={nextAmounts}
                    sign={sign}
                />
                <AmountBoxColumn
                    className={styleColumn6}
                    bidAskType={item.nextBidAskType}
                    amount={item.nextAmount}
                    amounts={nextAmounts}
                />

                <AmountChangeColumn
                    className={styleColumn7}
                    currentAmount={item.currentAmount}
                    nextAmount={item.nextAmount}
                    feed={item.feed}
                    amountChanges={amountChanges}
                />
                <FeedWithAmountChangeColumn
                    className={styleColumn8}
                    currentAmount={item.currentAmount}
                    nextAmount={item.nextAmount}
                    feed={item.feed}
                    amountChanges={amountChanges}
                />
            </div>
        );
    },
);

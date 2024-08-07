import cn from 'classnames';
import { memo, useMemo, useRef, useState } from 'react';

import type { TBidAskItem } from '../../modules/actions/orderBook/defs.ts';
import { OrderBookRow } from './components/OrderBookRow';
import {
    styleAdditionalSpace,
    styleDepthOfMarket,
    styleDepthOfMarketWrapper,
    styleOrderBook,
    styleSpan5,
} from './components/style.css';
import type { TOrderBookItem, TOrderBookProps } from './defs';
import { useCreateOrderBookItems } from './hooks/useCreateOrderBookItems';
import { useOrderBookPositioning } from './hooks/useOrderBookPositioning';

export const OrderBook = memo(({ className, current, update }: TOrderBookProps) => {
    const [midToWindowTopDiff, onSetMidToWindowTopDiff] = useState(undefined) as unknown as [
        number | undefined,
        (midToWindowTopDiff: number) => number,
    ];

    const midPriceRef = useRef<HTMLDivElement>(null);

    const { topItems, bottomItems } = useCreateOrderBookItems(current, update);

    const { currentAmounts, nextAmounts, prices, amountChanges } = useMemo(() => {
        const allItems = [...topItems, ...bottomItems];

        return {
            currentAmounts: allItems.map(({ currentAmount }) => currentAmount),
            nextAmounts: allItems.map(({ nextAmount }) => nextAmount),
            prices: allItems.map(({ price }) => price),
            amountChanges: allItems.reduce((acc, { currentAmount, nextAmount, feed }) => {
                if (Array.isArray(feed)) {
                    acc.push(currentAmount);
                    acc.push(nextAmount);
                } else {
                    acc.push(nextAmount - currentAmount);
                }

                return acc;
            }, [] as number[]),
        };
    }, [topItems, bottomItems]);

    const { containerRef, contentRef } = useOrderBookPositioning(
        midPriceRef,
        midToWindowTopDiff,
        onSetMidToWindowTopDiff,
        topItems.length,
        bottomItems.length,
    );

    return (
        <div className={cn(className, styleOrderBook)}>
            <div ref={containerRef} className={styleDepthOfMarketWrapper}>
                <div ref={contentRef} className={styleDepthOfMarket}>
                    <div className={styleAdditionalSpace} />

                    <OrderBookSide
                        items={topItems}
                        prices={prices}
                        currentAmounts={currentAmounts}
                        nextAmounts={nextAmounts}
                        amountChanges={amountChanges}
                    />

                    <div ref={midPriceRef} className={styleSpan5} />

                    <OrderBookSide
                        items={bottomItems}
                        prices={prices}
                        currentAmounts={currentAmounts}
                        nextAmounts={nextAmounts}
                        amountChanges={amountChanges}
                    />

                    <div className={styleAdditionalSpace} />
                </div>
            </div>
        </div>
    );
});

const OrderBookSide = memo(
    ({
        items,
        prices,
        currentAmounts,
        nextAmounts,
        amountChanges,
    }: {
        items: TOrderBookItem[];
        prices: TBidAskItem['price'][];
        currentAmounts: TBidAskItem['amount'][];
        nextAmounts: TBidAskItem['amount'][];
        amountChanges: TBidAskItem['amount'][];
    }) => (
        <>
            {items.map((item) => (
                <OrderBookRow
                    key={item.price}
                    item={item}
                    prices={prices}
                    currentAmounts={currentAmounts}
                    nextAmounts={nextAmounts}
                    amountChanges={amountChanges}
                />
            ))}
        </>
    ),
);

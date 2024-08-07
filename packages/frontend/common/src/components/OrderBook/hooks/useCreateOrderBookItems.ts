import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TBidAskItem } from '../../../modules/actions/orderBook/defs.ts';
import type { TDepthOfMarketData, TOrderBookItem } from '../defs';
import { EBidAsk } from '../defs';
import { sortDesc } from '../utils';

function mapBidAskItemToOrderBookItem(
    item: TBidAskItem,
    bidAskType: EBidAsk,
    currentAmount?: TOrderBookItem['currentAmount'],
): TOrderBookItem {
    return {
        currentBidAskType: bidAskType,
        nextBidAskType: bidAskType,
        price: item.price,
        currentAmount: currentAmount ?? item.amount,
        nextAmount: item.amount,
        feed: item.feed,
    };
}

function createDepthOfMarket(
    currentAsks: TOrderBookItem[],
    currentBids: TOrderBookItem[],
    updateAsks: TOrderBookItem[],
    updateBids: TOrderBookItem[],
    changeSidePrices: Map<number, TBidAskItem['feed']>,
) {
    const leftDom = [...currentAsks, ...currentBids].sort(sortDesc);
    const rightDom = [...updateAsks, ...updateBids].sort(sortDesc);

    const depthOfMarket: TOrderBookItem[] = [];
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < leftDom.length || rightIndex < rightDom.length) {
        const left = leftDom[leftIndex];
        const right = rightDom[rightIndex];

        if (left?.price === right?.price) {
            depthOfMarket.push({
                ...right,
                currentAmount: left.currentAmount,
                currentBidAskType: left.currentBidAskType,
                feed: changeSidePrices.has(right.price)
                    ? [changeSidePrices.get(right.price)!, right.feed as TBidAskItem['feed']]
                    : right.feed,
            });
            leftIndex++;
            rightIndex++;
        } else if (isNil(right) || (!isNil(left) && left.price > right.price)) {
            if (left.currentAmount > 0) {
                depthOfMarket.push(left);
            }
            leftIndex++;
        } else {
            if (right.nextAmount > 0) {
                depthOfMarket.push(right);
            }
            rightIndex++;
        }
    }

    return depthOfMarket;
}

function getPriceFeedMapForBothSides(
    update:
        | undefined
        | {
              asks: TBidAskItem[] | undefined;
              bids: TBidAskItem[] | undefined;
          },
) {
    const map = new Map<number, TBidAskItem['feed']>();
    const bidsPrices = new Set(update?.bids?.map(({ price }) => price));
    const asksPrices = new Set(update?.asks?.map(({ price }) => price));

    update?.asks?.forEach(({ price, amount, feed }) => {
        if (amount === 0 && bidsPrices.has(price)) {
            map.set(price, feed);
        }
    });

    update?.bids?.forEach(({ price, amount, feed }) => {
        if (amount === 0 && asksPrices.has(price)) {
            map.set(price, feed);
        }
    });

    return map;
}

export function useCreateOrderBookItems(
    current: TDepthOfMarketData,
    update?: TDepthOfMarketData,
): {
    topItems: TOrderBookItem[];
    bottomItems: TOrderBookItem[];
} {
    const currentAsks = useMemo(
        () =>
            current.asks
                .map((item) => mapBidAskItemToOrderBookItem(item, EBidAsk.Ask))
                .sort(sortDesc),
        [current.asks],
    );
    const currentBids = useMemo(
        () =>
            current.bids
                .map((item) => mapBidAskItemToOrderBookItem(item, EBidAsk.Bid))
                .sort(sortDesc),
        [current.bids],
    );

    const changeSidePrices = useMemo(() => getPriceFeedMapForBothSides(update), [update]);

    const updateAsks = useMemo(
        () =>
            update?.asks
                ?.filter(({ price, amount }) => amount !== 0 || !changeSidePrices.has(price))
                ?.map((item) => mapBidAskItemToOrderBookItem(item, EBidAsk.Ask, 0))
                ?.sort(sortDesc),
        [update, changeSidePrices],
    );
    const updateBids = useMemo(
        () =>
            update?.bids
                ?.filter(({ price, amount }) => amount !== 0 || !changeSidePrices.has(price))
                ?.map((item) => mapBidAskItemToOrderBookItem(item, EBidAsk.Bid, 0))
                ?.sort(sortDesc),
        [update, changeSidePrices],
    );

    return useMemo((): {
        topItems: TOrderBookItem[];
        bottomItems: TOrderBookItem[];
    } => {
        if (
            isNil(updateAsks) ||
            isNil(updateBids) ||
            (isEmpty(updateAsks) && isEmpty(updateBids))
        ) {
            return {
                topItems: currentAsks,
                bottomItems: currentBids,
            };
        }

        if (isEmpty(currentAsks) && isEmpty(currentBids)) {
            return {
                topItems: updateAsks,
                bottomItems: updateBids,
            };
        }
        const depthOfMarket = createDepthOfMarket(
            currentAsks,
            currentBids,
            updateAsks,
            updateBids,
            changeSidePrices,
        );

        let splitIndex = currentAsks?.length ?? 0;
        const firstBidPrice = currentBids[0]?.price;

        if (!isNil(firstBidPrice)) {
            const lastIndex = depthOfMarket.findLastIndex(({ price }) => price > firstBidPrice);

            if (lastIndex < 0) {
                splitIndex = depthOfMarket.length;
            } else {
                splitIndex = lastIndex + 1;
            }
        }

        return {
            topItems: depthOfMarket.slice(0, splitIndex),
            bottomItems: depthOfMarket.slice(splitIndex),
        };
    }, [changeSidePrices, currentAsks, currentBids, updateAsks, updateBids]);
}

import type { ISO } from '@common/types';
import type { NanoDate } from '@common/utils';
import { iso2NanoDate } from '@common/utils';
import { isNil } from 'lodash-es';
import memoizee from 'memoizee';

import type { TOrderBookSnapshot, TOrderBookUpdate } from '../../modules/actions/orderBook/defs.ts';
import { isResetOrderBookCommand } from '../../modules/actions/orderBook/defs.ts';
import { sprintf } from '../../utils/sprintf/sprintf';
import type { TOrderBookItem } from './defs';

export function getContainerHeight(containerElement: HTMLDivElement): number {
    return containerElement.clientHeight;
}

export function getContainerScrollTop(containerElement: HTMLDivElement): number {
    return containerElement.scrollTop;
}

export function getContentPartsMeasures(
    containerElement: HTMLDivElement,
    contentElement: HTMLDivElement,
    midPriceElement: HTMLDivElement,
) {
    const contentHeight = contentElement.offsetHeight;
    const midPriceHeight = midPriceElement.offsetHeight;
    const asksBlockHeight = midPriceElement.offsetTop - contentElement.offsetTop;
    const bidsBlockHeight = contentHeight - midPriceHeight - asksBlockHeight;

    return {
        asksBlockHeight,
        midPriceHeight,
        bidsBlockHeight,
    };
}

export function getFullAsksBlockHeight(
    containerElement: HTMLDivElement,
    midPriceElement: HTMLDivElement,
): number {
    return midPriceElement.offsetTop - containerElement.offsetTop;
}

export function sortDesc(a: TOrderBookItem, b: TOrderBookItem) {
    return b.price - a.price;
}

export function isError(value: unknown): value is Error {
    return !isNil(value) && value instanceof Error;
}

export function mergeUpdateToSnapshot(
    snapshot: TOrderBookSnapshot,
    update?: TOrderBookUpdate,
): TOrderBookSnapshot {
    if (isNil(update)) {
        return snapshot;
    }

    const snapshotHeader = {
        platformTime: update.platformTime,
        exchangeTime: update.exchangeTime,
        sequenceNo: update.sequenceNo,
    };

    if (isResetOrderBookCommand(update.kind)) {
        return {
            asks: [],
            bids: [],
            ...snapshotHeader,
        };
    }

    const { asks, bids } = update.kind.regular;

    const asksSet = new Map(snapshot.asks.map((bidAsk) => [bidAsk.price, bidAsk]));
    const bidsSet = new Map(snapshot.bids.map((bidAsk) => [bidAsk.price, bidAsk]));

    for (const { price, amount } of asks) {
        if (amount === 0) {
            asksSet.delete(price);
            bidsSet.delete(price);
        }
    }

    for (const { price, amount } of bids) {
        if (amount === 0) {
            asksSet.delete(price);
            bidsSet.delete(price);
        }
    }

    for (const ask of asks) {
        asksSet.delete(ask.price);
        if (ask.amount > 0) {
            asksSet.set(ask.price, { price: ask.price, amount: ask.amount });
        }
    }

    for (const bid of bids) {
        bidsSet.delete(bid.price);
        if (bid.amount > 0) {
            bidsSet.set(bid.price, { price: bid.price, amount: bid.amount });
        }
    }

    return {
        asks: Array.from(asksSet.values()).sort((a, b) => b.price - a.price),
        bids: Array.from(bidsSet.values()).sort((a, b) => b.price - a.price),
        ...snapshotHeader,
    };
}

export function getNanoDate(iso: null | ISO): undefined | NanoDate {
    return isNil(iso) ? undefined : iso2NanoDate(iso);
}

export function getEqualParts(
    left: undefined | string,
    right: undefined | string,
): undefined | { equal: string; left: string; right: string } {
    if (isNil(left) || isNil(right)) {
        return undefined;
    }

    let index = 0;
    for (; index < Math.min(left.length, right.length); index++) {
        if (left[index] !== right[index]) {
            break;
        }
    }

    return {
        equal: left.substring(0, index),
        left: left.substring(index),
        right: right.substring(index),
    };
}

export const number2DisplayNumber = memoizee(
    (number: number, formatter: string): string => sprintf(formatter, number),
    {
        primitive: true,
        max: 1000,
    },
);

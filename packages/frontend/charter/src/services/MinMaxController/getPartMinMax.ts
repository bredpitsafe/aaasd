import { mapGet, weakMapGet } from '@common/utils';
import {
    decreaseIndexWhileBigger,
    findLeftClosestIndex,
    findRightIndexByEqual,
    increaseIndexWhileLower,
} from '@frontend/common/src/utils/findClosest';

import type { TPart, TPartId, TPointValue } from '../../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../../lib/Parts/def';
import { getFirstPointTime, getLastPointTime } from '../../../lib/Parts/utils/point';
import { getMax, getMin } from './utils';

type TCacheSize = number;
const minCacheSize = 64;
// cacheSizes must have common divisor!
const cacheSizes: TCacheSize[] = [
    minCacheSize, // 64
    minCacheSize * 4, // 256
    minCacheSize * 16, // 1024
];
type TCachePeace = {
    lastIndex: number;
    min: number;
    max: number;
};
const cacheParts = new WeakMap<TPartId, Map<number, TCachePeace>>();

const createMap = () => new Map<number, TCachePeace>();
const createCachePeace = () => ({
    lastIndex: 0,
    min: Infinity,
    max: -Infinity,
});
// get uniq number - https://stackoverflow.com/questions/919612/mapping-two-integers-to-one-in-a-unique-and-deterministic-way
const getKey = (a: number, b: number): number => (a >= b ? a * a + a + b : a + b * b); // Szudzik's function

export function getPartMinMax(
    part: TPart,
    leftEdge: number,
    rightEdge: number,
): [TPointValue, TPointValue] {
    const buffer = part.buffer;
    const itemSize = POINT_ITEM_SIZE;
    const cache = weakMapGet(cacheParts, part as object, createMap);
    const cachePieces: TCachePeace[] = [];
    let value: number;
    let nextIndex: undefined | number;
    let cacheSize: number;
    let cacheSizeIndex: number;
    let cachePiece: undefined | TCachePeace;

    const firstPointTime = getFirstPointTime(part);
    const lastPointTime = getLastPointTime(part);

    if (
        firstPointTime !== undefined &&
        lastPointTime !== undefined &&
        (firstPointTime > rightEdge || lastPointTime < leftEdge)
    ) {
        return [Infinity, -Infinity] as [TPointValue, TPointValue];
    }

    let maxIndex = decreaseIndexWhileBigger(
        rightEdge,
        findRightIndexByEqual(
            findLeftClosestIndex(rightEdge, part.buffer, POINT_ITEM_SIZE),
            part.buffer,
            POINT_ITEM_SIZE,
        ),
        part.buffer,
        POINT_ITEM_SIZE,
    );
    if (maxIndex < 0) {
        maxIndex = part.size - 1;
    }

    let index = increaseIndexWhileLower(
        leftEdge,
        findLeftClosestIndex(leftEdge, part.buffer, POINT_ITEM_SIZE),
        part.buffer,
        POINT_ITEM_SIZE,
    );
    if (index < 0) {
        index = 0;
    }

    let min = Infinity;
    let max = -Infinity;

    while (index <= maxIndex) {
        if (index % minCacheSize === 0) {
            nextIndex = undefined;
            cacheSizeIndex = cacheSizes.length;

            // update actual cachePieces
            while (--cacheSizeIndex >= 0) {
                cacheSize = cacheSizes[cacheSizeIndex];

                if (index % cacheSize === 0) {
                    cachePiece = cachePieces[cacheSizeIndex] = mapGet(
                        cache,
                        getKey(cacheSize, index),
                        createCachePeace,
                    );

                    // update min/max from cache
                    if (cachePiece.lastIndex !== 0 && cachePiece.lastIndex <= maxIndex) {
                        nextIndex = cachePiece.lastIndex;
                        min = getMin(min, cachePiece.min);
                        max = getMax(max, cachePiece.max);
                        break;
                    }
                }
            }

            if (cachePiece !== undefined) {
                // Case when large cache is empty, we have to copy min/max from smaller one to bigger one
                let biggerCacheSizeIndex = cacheSizeIndex;

                while (++biggerCacheSizeIndex < cachePieces.length) {
                    const biggerCachePiece = cachePieces[biggerCacheSizeIndex];

                    if (biggerCachePiece.lastIndex <= cachePiece.lastIndex) {
                        biggerCachePiece.lastIndex = cachePiece.lastIndex;
                        biggerCachePiece.min = getMin(biggerCachePiece.min, cachePiece.min);
                        biggerCachePiece.max = getMax(biggerCachePiece.max, cachePiece.max);
                    }
                }
            }

            if (nextIndex !== undefined) {
                // if we get nextIndex, we should actualize cachePieces, that set before this (with smaller cacheSize)
                while (--cacheSizeIndex >= 0) {
                    cacheSize = cacheSizes[cacheSizeIndex];
                    cachePieces[cacheSizeIndex] = mapGet(
                        cache,
                        getKey(cacheSize, nextIndex - (nextIndex % cacheSize)),
                        createCachePeace,
                    );
                }

                index = nextIndex + 1;
                // go check new cache pieces
                continue;
            }
        }

        value = buffer[index * itemSize + 1];
        // update common min/max
        min = getMin(min, value);
        max = getMax(max, value);

        for (let i = 0; i < cachePieces.length; i++) {
            cachePiece = cachePieces[i];
            // update cache min/max once
            if (cachePiece.lastIndex <= index) {
                cachePiece.lastIndex = index;
                cachePiece.min = getMin(cachePiece.min, value);
                cachePiece.max = getMax(cachePiece.max, value);
            }
        }

        index += 1;
    }

    return [min, max] as [TPointValue, TPointValue];
}

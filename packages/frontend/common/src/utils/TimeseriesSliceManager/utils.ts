import type { TSomeDateType } from '@common/types';
import { compareDates, diffDatesInNanoseconds, isClampedDates, isEqualDates } from '@common/utils';

import { EMPTY_ARRAY } from '../const';
import { binarySearch } from '../findClosest';
import type { TContext } from './def';
import { FINITE_FUTURE, FINITE_PAST } from './def';
import { Slice } from './Slice';

function findClosestIndex<T>(
    { getTime }: TContext<T>,
    source: ReadonlyArray<T>,
    needleTime: TSomeDateType,
): number {
    if (source.length === 0) return -1;
    return binarySearch(0, source.length - 1, (index) => {
        const item = source[index];
        const itemTime = getTime(item);
        return diffDatesInNanoseconds(itemTime, needleTime);
    });
}

// inclusive search
export function findClosestIndexAfter<T>(
    ctx: TContext<T>,
    source: ReadonlyArray<T>,
    needleId: unknown,
    needleTime: TSomeDateType,
): number {
    let closest = findClosestIndex(ctx, source, needleTime);

    if (closest === -1) return -1;

    const { getTime, getId } = ctx;

    if (compareDates(getTime(source[closest]), needleTime) < 0) {
        return closest === source.length - 1 ? -1 : closest + 1;
    }

    while (
        closest < source.length - 1 &&
        isEqualDates(getTime(source[closest]), getTime(source[closest + 1]))
    ) {
        closest++;
    }

    while (
        closest > 0 &&
        needleId !== getId(source[closest]) &&
        isEqualDates(getTime(source[closest]), getTime(source[closest - 1]))
    ) {
        closest--;
    }

    return closest;
}

// inclusive search
export function findClosestIndexBefore<T>(
    ctx: TContext<T>,
    source: ReadonlyArray<T>,
    needleId: unknown,
    needleTime: TSomeDateType,
): number {
    let closest = findClosestIndex(ctx, source, needleTime);

    if (closest === -1) return -1;

    const { getTime, getId } = ctx;

    if (compareDates(getTime(source[closest]), needleTime) > 0) {
        return closest - 1;
    }

    while (closest > 0 && isEqualDates(getTime(source[closest]), getTime(source[closest - 1]))) {
        closest--;
    }

    while (
        closest < source.length - 1 &&
        needleId !== getId(source[closest]) &&
        isEqualDates(getTime(source[closest]), getTime(source[closest + 1]))
    ) {
        closest++;
    }

    return closest;
}

export function splitSlice<T>(
    ctx: TContext<T>,
    slice: Slice<T>,
    boundId: unknown,
    boundTime: TSomeDateType,
) {
    if (!isClampedDates(boundTime, slice.leftBound, slice.rightBound)) {
        throw new Error('Bound is not clamped by slice');
    }

    if (isEqualDates(slice.leftBound, boundTime)) {
        return {
            left: undefined,
            right: slice,
        };
    }

    if (isEqualDates(slice.rightBound, boundTime)) {
        return {
            left: slice,
            right: undefined,
        };
    }

    if (!slice.isFilled()) {
        return {
            left: new Slice<T>(ctx, slice.leftBound, slice.leftBoundInclude, boundTime, false),
            right: new Slice<T>(ctx, boundTime, false, slice.rightBound, slice.rightBoundInclude),
        };
    } else {
        let itemsBoundIndex = findClosestIndexAfter(ctx, slice.items, boundId, boundTime);
        itemsBoundIndex = itemsBoundIndex === -1 ? slice.items.length - 1 : itemsBoundIndex;

        const leftItems = slice.items.slice(0, itemsBoundIndex + 1);
        const rightItems = slice.items.slice(itemsBoundIndex + 1);

        const lastLeftItem = leftItems[leftItems.length - 1];
        const includeLeftBound =
            lastLeftItem !== undefined && isEqualDates(boundTime, ctx.getTime(lastLeftItem));

        const firstRightItem = rightItems[0];
        const includeRightBound =
            firstRightItem !== undefined && isEqualDates(boundTime, ctx.getTime(firstRightItem));

        return {
            left: new Slice<T>(
                ctx,
                slice.leftBound,
                slice.leftBoundInclude,
                boundTime,
                includeLeftBound,
                leftItems,
            ),
            right: new Slice<T>(
                ctx,
                boundTime,
                includeRightBound,
                slice.rightBound,
                slice.rightBoundInclude,
                rightItems,
            ),
        };
    }
}

function findSliceIndex<T>(slices: Slice<T>[], time: TSomeDateType): number {
    return binarySearch(0, slices.length - 1, (index) => {
        const slice = slices[index];
        const compareStart = compareDates(slice.leftBound, time);
        const compareEnd = compareDates(slice.rightBound, time);

        if (compareStart <= 0 && compareEnd >= 0) {
            return 0;
        }

        if (compareStart === 1) {
            return diffDatesInNanoseconds(slice.leftBound, time);
        }

        if (compareEnd === -1) {
            return diffDatesInNanoseconds(slice.rightBound, time);
        }

        throw new Error('Unexpected comparison result');
    });
}

export function findLeftestSliceIndex<T>(
    { getTime }: TContext<T>,
    slices: Slice<T>[],
    time: TSomeDateType,
): number {
    const index = findSliceIndex(slices, time);
    const boundTime = slices[index].leftBound;

    if (index <= 0 || compareDates(time, boundTime) > 0) return index;

    let slice;
    let closest = index;
    while (
        (slice = slices[closest - 1]) &&
        compareDates(slice.rightBound, boundTime) === 0 &&
        slice.isFilled() &&
        slice.items.length > 0 &&
        compareDates(getTime(slice.items[slice.items.length - 1]), boundTime) === 0
    ) {
        closest--;
    }

    return closest;
}

export function findRightestSliceIndex<T>(
    { getTime }: TContext<T>,
    slices: Slice<T>[],
    time: TSomeDateType,
): number {
    const index = findSliceIndex(slices, time);
    const boundTime = slices[index].rightBound;

    if (index === -1 || index === slices.length - 1 || compareDates(time, boundTime) < 0)
        return index;

    let slice;
    let closest = index;
    while (
        (slice = slices[closest + 1]) &&
        compareDates(slice.leftBound, boundTime) === 0 &&
        slice.isFilled() &&
        slice.items.length > 0 &&
        compareDates(getTime(slice.items[0]), boundTime) === 0
    ) {
        closest++;
    }

    return closest;
}

export function checkArgsAndGetEndTime(
    startTime: TSomeDateType,
    count: number,
    endTime?: TSomeDateType,
) {
    if (count > 0) {
        endTime = endTime ?? FINITE_FUTURE;

        if (endTime < startTime) {
            throw new Error('endTime must be greater than startTime');
        }
    } else {
        endTime = endTime ?? FINITE_PAST;

        if (endTime > startTime) {
            throw new Error('endTime must be lower than startTime');
        }
    }

    return endTime;
}

export function checkSortedSlices(slices: Slice<any>[]) {
    for (let i = 1; i < slices.length; i++) {
        if (compareDates(slices[i - 1].rightBound, slices[i].leftBound) > 0) {
            throw new Error('Slices must be sorted by start');
        }
    }
}

export function checkSlicesHasEqualSegment(slices1: Slice<any>[], slices2: Slice<any>[]) {
    const equalStart = slices1[0].leftBound === slices2[0].leftBound;
    const equalEnd =
        slices1[slices1.length - 1].rightBound === slices2[slices2.length - 1].rightBound;

    if (!equalStart || !equalEnd) {
        throw new Error('Slices must have equal start and end');
    }
}

export function squashSlices<T>(ctx: TContext<T>, slices: Slice<T>[]): Slice<T> {
    const items: Array<Array<T>> = [];

    for (const slice of slices) {
        if (slice.isFilled()) {
            items.push(slice.items as Array<T>);
        }
    }

    return new Slice(
        ctx,
        slices[0].leftBound,
        slices[0].leftBoundInclude,
        slices[slices.length - 1].rightBound,
        slices[slices.length - 1].rightBoundInclude,
        items.flat(),
    );
}

export function leftSplitItems<T>(slice: Slice<T>, items: T[]): [toSlice: T[], rest: T[]] {
    if (!slice.isFilled()) {
        throw new Error('Slice: items is undefined');
    }

    const { getTime, getId } = slice.ctx;
    const firstItemId = getId(items[0]);
    const firstItemTime = getTime(items[0]);
    const closestIndex = slice.getClosestIndexBefore(firstItemTime, firstItemId);
    const closestItemId = getId(slice.items[closestIndex]);
    const closestItemTime = getTime(slice.items[closestIndex]);
    const hasEqualTime = isEqualDates(firstItemTime, closestItemTime);
    const hasEqualId = firstItemId === closestItemId;
    let toSlice: T[] = EMPTY_ARRAY;

    // remove items that already in store
    if ((!hasEqualTime && !hasEqualId) || (hasEqualTime && hasEqualId)) {
        items = items.slice(slice.items.length - closestIndex);
    }

    // add the remaining item to the slice that are included in it
    let i = 0;
    while (i < items.length) {
        const diff = compareDates(getTime(items[i]), slice.rightBound);
        const canAdd = diff < 0 || (diff === 0 && slice.rightBoundInclude);

        if (canAdd) i++;
        else break;
    }

    if (i !== 0) {
        toSlice = items.slice(0, i);
        items = items.slice(i);
    }

    return [toSlice, items];
}

export function rightSplitItems<T>(slice: Slice<T>, items: T[]): [toSlice: T[], rest: T[]] {
    if (!slice.isFilled()) {
        throw new Error('Slice: items is undefined');
    }

    const { getTime, getId } = slice.ctx;
    const lastItemId = getId(items[items.length - 1]);
    const lastItemTime = getTime(items[items.length - 1]);
    const closestIndex = slice.getClosestIndexAfter(lastItemTime, lastItemId);
    const closestItemId = getId(slice.items[closestIndex]);
    const closestItemTime = getTime(slice.items[closestIndex]);
    const hasEqualTime = isEqualDates(lastItemTime, closestItemTime);
    const hasEqualId = lastItemId === closestItemId;
    let toSlice: T[] = EMPTY_ARRAY;

    if ((!hasEqualTime && !hasEqualId) || (hasEqualTime && hasEqualId)) {
        items = items.slice(0, items.length - 1 - closestIndex);
    }

    // add rest items to slice with same time
    let i = items.length - 1;
    while (i > 0) {
        const diff = compareDates(getTime(items[i]), slice.leftBound);
        const canAdd = diff > 0 || (diff === 0 && slice.leftBoundInclude);

        if (canAdd) i--;
        else break;
    }

    if (i !== items.length - 1) {
        toSlice = items.slice(i);
        items = items.slice(0, i);
    }

    return [toSlice, items];
}

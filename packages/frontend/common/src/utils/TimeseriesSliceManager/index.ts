import type { TSomeDateType } from '@common/types';
import { compareDates, isClampedDates, isEqualDates, maxDate, minDate } from '@common/utils';
import { compact, isArray, isUndefined } from 'lodash-es';

import { EMPTY_ARRAY } from '../const';
import type { TContext } from './def';
import { FINITE_FUTURE, FINITE_PAST } from './def';
import { Slice } from './Slice';
import {
    checkArgsAndGetEndTime,
    checkSlicesHasEqualSegment,
    checkSortedSlices,
    findClosestIndexAfter,
    findClosestIndexBefore,
    findLeftestSliceIndex,
    findRightestSliceIndex,
    leftSplitItems,
    rightSplitItems,
    splitSlice,
    squashSlices,
} from './utils';

export class TimeseriesSliceManager<T> {
    private slices: Slice<T>[];

    constructor(private ctx: TContext<T>) {
        this.slices = [new Slice(this.ctx, FINITE_PAST, true, FINITE_FUTURE, true)];
    }

    clear() {
        this.slices = [new Slice(this.ctx, FINITE_PAST, true, FINITE_FUTURE, true)];
    }

    addItems(
        items: T[],
        leftTime?: TSomeDateType,
        rightTime?: TSomeDateType,
        leftInclude?: boolean,
        rightInclude?: boolean,
    ) {
        const { ctx, slices } = this;
        const { getId, getTime } = ctx;

        if (
            leftTime !== undefined &&
            rightTime !== undefined &&
            compareDates(leftTime, rightTime) > 0
        ) {
            throw new Error('Start time cannot be greater than end time');
        }

        if (items.length === 0) {
            if (leftTime !== undefined && rightTime !== undefined) {
                this.markIntervalAsEmpty(leftTime, rightTime);
            }

            return;
        }

        const firstItem = items[0];
        const firstItemTime = getTime(firstItem);
        const lastItem = items[items.length - 1];
        const lastItemTime = getTime(lastItem);

        if (compareDates(firstItemTime, lastItemTime) > 0) {
            throw new Error('Items must be sorted by time');
        }

        if (leftTime !== undefined && compareDates(leftTime, firstItemTime) > 0) {
            throw new Error('Start time cannot be greater than first item time');
        }

        if (rightTime !== undefined && compareDates(rightTime, lastItemTime) < 0) {
            throw new Error('End time cannot be less than last item time');
        }

        leftTime ??= firstItemTime;
        rightTime ??= lastItemTime;

        if (leftInclude === false && isEqualDates(firstItemTime, leftTime)) {
            throw new Error('Left Bound time cannot be equal to first item time');
        }

        if (rightInclude === false && isEqualDates(lastItemTime, rightTime)) {
            throw new Error('Right bound time cannot be equal to last item time');
        }

        let leftIntersection = this.findLeftestSliceIndex(slices, leftTime);
        let rightIntersection = this.findRightestSliceIndex(slices, rightTime);

        if (leftIntersection < 0) {
            throw new Error('Left slice is not found');
        }

        if (rightIntersection < 0) {
            throw new Error('Right slice is not found');
        }

        const leftSlice = slices[leftIntersection];
        const rightSlice = slices[rightIntersection];
        let leftSliceExtender: T[] = EMPTY_ARRAY;
        let rightSliceExtender: T[] = EMPTY_ARRAY;

        if (items.length > 0) {
            const leftSplit = () => {
                const hasIntersectsWithLeftSlicePoints =
                    items.length > 0 &&
                    leftSlice.isFilled() &&
                    leftSlice.items.length > 0 &&
                    isClampedDates(
                        getTime(items[0]),
                        getTime(leftSlice.items[0]),
                        getTime(leftSlice.items[leftSlice.items.length - 1]),
                    );

                if (hasIntersectsWithLeftSlicePoints) {
                    [leftSliceExtender, items] = leftSplitItems(leftSlice, items);
                }

                if (leftSlice.isFilled()) {
                    leftTime =
                        items.length > 0
                            ? minDate(leftSlice.rightBound, getTime(items[0]))
                            : leftSlice.rightBound;
                    leftInclude =
                        leftTime === leftSlice.rightBound ? !leftSlice.rightBoundInclude : true;
                    leftIntersection = Math.min(leftIntersection + 1, rightIntersection);
                }
            };
            const rightSplit = () => {
                const hasIntersectsWithRightSlicePoints =
                    items.length > 0 &&
                    rightSlice.isFilled() &&
                    rightSlice.items.length > 0 &&
                    isClampedDates(
                        getTime(items[items.length - 1]),
                        getTime(rightSlice.items[0]),
                        getTime(rightSlice.items[rightSlice.items.length - 1]),
                    );

                if (hasIntersectsWithRightSlicePoints) {
                    [rightSliceExtender, items] = rightSplitItems(rightSlice, items);
                }

                if (rightSlice.isFilled()) {
                    rightTime =
                        items.length > 0
                            ? maxDate(rightSlice.leftBound, getTime(items[items.length - 1]))
                            : rightSlice.leftBound;
                    rightInclude =
                        rightTime === rightSlice.leftBound ? !rightSlice.leftBoundInclude : true;
                    rightIntersection = Math.max(rightIntersection - 1, leftIntersection);
                }
            };

            const splitCommands = [leftSplit, rightSplit];
            const orderExecution =
                leftSlice !== rightSlice
                    ? 1
                    : // if items have intersection from one side, we have to start from this side
                      leftSlice.findItemIndex(firstItem) > -1
                      ? 1
                      : rightSlice.findItemIndex(lastItem) > -1
                        ? -1
                        : 1;

            if (orderExecution === -1) {
                splitCommands.reverse();
            }

            splitCommands.forEach((split) => split());
        }

        if (items.length > 0 || compareDates(leftTime, rightTime) < 0) {
            const { left } = splitSlice(
                ctx,
                slices[leftIntersection],
                items.length > 0 ? getId(items[0]) : undefined,
                leftTime,
            );
            const { right } = splitSlice(
                ctx,
                slices[rightIntersection],
                items.length > 0 ? getId(items[items.length - 1]) : undefined,
                rightTime,
            );
            const newSlice: Slice<T> = new Slice(
                ctx,
                leftTime,
                (isUndefined(left) ? undefined : !left.rightBoundInclude) ?? leftInclude ?? true,
                rightTime,
                (isUndefined(right) ? undefined : !right.leftBoundInclude) ?? rightInclude ?? true,
                items,
            );

            slices.splice(
                leftIntersection,
                rightIntersection - leftIntersection + 1,
                ...compact([left, newSlice, right]),
            );
        }

        // only after all operation we can extend left and right slices
        if (isArray(leftSliceExtender) && leftSliceExtender.length > 0) {
            leftSlice.pushItems(leftSliceExtender);
        }

        if (isArray(rightSliceExtender) && rightSliceExtender.length > 0) {
            rightSlice.shiftItems(rightSliceExtender);
        }

        return this;
    }

    private markIntervalAsEmpty(
        leftTime: TSomeDateType,
        rightTime: TSomeDateType,
        leftInclude?: boolean,
        rightInclude?: boolean,
    ) {
        if (isEqualDates(leftTime, rightTime)) return;

        let leftSliceIndex = this.findLeftestSliceIndex(this.slices, leftTime);
        let rightSliceIndex = this.findLeftestSliceIndex(this.slices, rightTime);

        const slices = this.slices.slice(leftSliceIndex, rightSliceIndex + 1);

        if (slices.length > 0 && compareDates(slices[0].rightBound, leftTime) === 0) {
            leftSliceIndex++;
            slices.shift();
        }

        if (
            slices.length > 0 &&
            compareDates(slices[slices.length - 1].leftBound, rightTime) === 0
        ) {
            rightSliceIndex--;
            slices.pop();
        }

        if (slices.length === 0) {
            throw new Error('Cannot found slice for mark as empty');
        }

        if (slices.some((s) => s.items !== undefined && s.items.length > 0)) {
            throw new Error(
                `Cannot mark interval[${leftTime}, ${rightTime}] as empty because it contains items`,
            );
        }

        const { left } = splitSlice(this.ctx, this.slices[leftSliceIndex], undefined, leftTime);
        const { right } = splitSlice(this.ctx, this.slices[rightSliceIndex], undefined, rightTime);
        const newSlice: Slice<T> = new Slice(
            this.ctx,
            leftTime,
            (isUndefined(left) ? undefined : !left.rightBoundInclude) ?? leftInclude ?? true,
            rightTime,
            (isUndefined(right) ? undefined : !right.leftBoundInclude) ?? rightInclude ?? true,
            EMPTY_ARRAY,
        );

        this.slices.splice(
            leftSliceIndex,
            rightSliceIndex - leftSliceIndex + 1,
            ...compact([left, newSlice, right]),
        );
    }

    getAllSlices(): ReadonlyArray<Slice<T>> {
        return this.slices as ReadonlyArray<Slice<T>>;
    }

    getSlices(count: number, leftTime: TSomeDateType, rightTime?: TSomeDateType): Array<Slice<T>> {
        rightTime = checkArgsAndGetEndTime(leftTime, count, rightTime);

        if (this.slices.length === 1 && this.slices[0].items === undefined) return this.slices;

        const isForward = count > 0;
        const result: Array<Slice<T>> = [];
        const getStartSliceIndex = isForward
            ? this.findLeftestSliceIndex
            : this.findRightestSliceIndex;
        const startSliceIndex = getStartSliceIndex(this.slices, leftTime);
        const getEndSliceIndex = isForward
            ? this.findRightestSliceIndex
            : this.findLeftestSliceIndex;
        const endSliceIndex = getEndSliceIndex(this.slices, rightTime);
        const startSlice = this.slices[startSliceIndex];
        count = Math.abs(count);

        if (startSlice.items !== undefined) {
            const findClosestIndex = isForward ? findClosestIndexAfter : findClosestIndexBefore;
            const intersectionIndex = findClosestIndex(
                this.ctx,
                startSlice.items,
                undefined,
                leftTime,
            );

            if (intersectionIndex !== -1) {
                const length = isForward
                    ? startSlice.items.length - intersectionIndex
                    : intersectionIndex + 1;
                count = count - length;
            }
        }

        result.push(startSlice);

        const delta = isForward ? 1 : -1;
        let sliceIndex = startSliceIndex + delta;

        while (count > 0 && (endSliceIndex - sliceIndex) * delta >= 0) {
            const slice = this.slices[sliceIndex];
            const items = slice.items;

            result.push(slice);
            sliceIndex = sliceIndex + delta;

            if (items !== undefined) {
                count -= items.length;
            }
        }

        return isForward ? result : result.reverse();
    }

    extractItems(
        slices: Slice<T>[], // must be sorted by time
        startTime: TSomeDateType,
        count: number,
        endTime?: TSomeDateType,
    ): Array<T> {
        checkSortedSlices(slices);
        endTime = checkArgsAndGetEndTime(startTime, count, endTime);

        const isForward = count > 0;
        const delta = isForward ? 1 : -1;
        const getStartSliceIndex = isForward
            ? this.findLeftestSliceIndex
            : this.findRightestSliceIndex;
        const startSliceIndex = getStartSliceIndex(slices, startTime);
        const getEndSliceIndex = isForward
            ? this.findRightestSliceIndex
            : this.findLeftestSliceIndex;
        const endSliceIndex = getEndSliceIndex(slices, endTime, slices.length - 1);
        const nestedResult: T[][] = [];
        count = Math.abs(count);

        let sliceIndex = startSliceIndex;
        while (count > 0 && (endSliceIndex - sliceIndex) * delta >= 0) {
            let starIndex = -Infinity;
            let endIndex = Infinity;

            const isStartSlice = sliceIndex === startSliceIndex;
            const isEndSlice = sliceIndex === endSliceIndex;
            const slice = slices[sliceIndex];
            const items = slice.items;
            const isSuitableItems = items !== undefined && items.length > 0;

            if (isSuitableItems && isStartSlice) {
                const findClosestIndex = isForward ? findClosestIndexAfter : findClosestIndexBefore;
                let intersectionIndex = findClosestIndex(this.ctx, items, undefined, startTime);

                if (isForward) {
                    intersectionIndex = intersectionIndex === -1 ? items.length : intersectionIndex;
                    starIndex = intersectionIndex;
                    endIndex = Math.min(items.length, intersectionIndex + count);
                } else {
                    intersectionIndex = intersectionIndex === -1 ? -1 : intersectionIndex;
                    starIndex = Math.max(0, intersectionIndex + 1 - count);
                    endIndex = intersectionIndex + 1;
                }
            }

            if (isSuitableItems && isEndSlice) {
                const findClosestIndex = !isForward
                    ? findClosestIndexAfter
                    : findClosestIndexBefore;
                let intersectionIndex = findClosestIndex(this.ctx, items, undefined, endTime);

                if (isForward) {
                    intersectionIndex = intersectionIndex === -1 ? -1 : intersectionIndex;
                    starIndex = Math.max(starIndex, 0);
                    endIndex = Math.min(endIndex, intersectionIndex + 1, starIndex + count);
                } else {
                    intersectionIndex = intersectionIndex === -1 ? items.length : intersectionIndex;
                    endIndex = Math.min(endIndex, items.length);
                    starIndex = Math.max(starIndex, intersectionIndex, endIndex - count);
                }
            }

            if (isSuitableItems && !isStartSlice && !isEndSlice) {
                if (items.length <= count) {
                    starIndex = 0;
                    endIndex = items.length;
                } else if (isForward) {
                    sliceIndex = 0;
                    endIndex = count;
                } else if (!isForward) {
                    starIndex = items.length - count;
                    endIndex = items.length;
                }
            }

            if (
                isSuitableItems &&
                isFinite(starIndex) &&
                isFinite(endIndex) &&
                starIndex < endIndex
            ) {
                const copyItems =
                    starIndex === 0 && endIndex === items.length
                        ? (items as T[])
                        : items.slice(starIndex, endIndex);

                count = count - copyItems.length;
                nestedResult.push(copyItems);
            }

            sliceIndex = sliceIndex + delta;
        }

        return (isForward ? nestedResult : nestedResult.reverse()).flat();
    }

    getItems(count: number, leftTime: TSomeDateType, rightTime?: TSomeDateType): T[] {
        return this.extractItems(
            this.getSlices(count, leftTime, rightTime),
            leftTime,
            count,
            rightTime,
        );
    }

    squashSlices(slices: Slice<T>[]): Slice<T> {
        const squashedSlice = squashSlices(this.ctx, slices);
        this.replaceSlices(slices, [squashedSlice]);
        return squashedSlice;
    }

    private replaceSlices(replaceSlices: Slice<T>[], newSlices: Slice<T>[]) {
        checkSortedSlices(replaceSlices);
        checkSortedSlices(newSlices);
        checkSlicesHasEqualSegment(replaceSlices, newSlices);

        const firstSlice = replaceSlices[0];
        const lastSlice = replaceSlices[replaceSlices.length - 1];
        const firstSliceIndex = this.slices.indexOf(firstSlice);
        const lastSliceIndex = this.slices.indexOf(lastSlice);

        this.slices.splice(firstSliceIndex, lastSliceIndex - firstSliceIndex + 1, ...newSlices);
    }

    private findLeftestSliceIndex = (
        slices: Slice<T>[],
        time: TSomeDateType,
        fallbackIndex?: number,
    ) => {
        const index = findLeftestSliceIndex(this.ctx, slices, time);

        if (index === -1) {
            if (fallbackIndex !== undefined) return fallbackIndex;
            else throw new Error('Slice not found');
        }

        return index;
    };

    private findRightestSliceIndex = (
        slices: Slice<T>[],
        time: TSomeDateType,
        fallbackIndex?: number,
    ) => {
        const index = findRightestSliceIndex(this.ctx, slices, time);

        if (index === -1) {
            if (fallbackIndex !== undefined) return fallbackIndex;
            else throw new Error('Slice not found');
        }

        return index;
    };
}

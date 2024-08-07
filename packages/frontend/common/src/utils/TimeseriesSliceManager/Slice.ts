import type { TSomeDateType } from '@common/types';
import { compareDates, isEqualDates } from '@common/utils';
import { isUndefined } from 'lodash-es';

import { EMPTY_ARRAY } from '../const';
import type { TContext } from './def';
import { findClosestIndexAfter, findClosestIndexBefore } from './utils';

export class Slice<T> {
    constructor(
        public ctx: TContext<T>,
        public readonly leftBound: TSomeDateType,
        public readonly leftBoundInclude: boolean,
        public readonly rightBound: TSomeDateType,
        public readonly rightBoundInclude: boolean,
        public items?: Array<T>,
    ) {
        if (compareDates(leftBound, rightBound) > 0) {
            throw new Error('Slice: left > right');
        }

        const firstItem = items?.at(0);
        const lastItem = items?.at(-1);

        if (
            !leftBoundInclude &&
            !isUndefined(firstItem) &&
            isEqualDates(leftBound, ctx.getTime(firstItem))
        ) {
            throw new Error('Slice: left is included in items');
        }

        if (
            !rightBoundInclude &&
            !isUndefined(lastItem) &&
            isEqualDates(rightBound, ctx.getTime(lastItem))
        ) {
            throw new Error('Slice: right is included in items');
        }
    }

    isFilled(): this is Slice<T> & { items: ReadonlyArray<T> } {
        return this.items !== undefined;
    }

    getClosestIndexBefore(time: TSomeDateType, id?: unknown): number {
        if (this.items === undefined) {
            throw new Error('Slice: items is undefined');
        }

        return findClosestIndexBefore(this.ctx, this.items, id, time);
    }

    getClosestIndexAfter(time: TSomeDateType, id?: unknown): number {
        if (this.items === undefined) {
            throw new Error('Slice: items is undefined');
        }

        return findClosestIndexAfter(this.ctx, this.items, id, time);
    }

    setItems(items: T[]): this {
        this.items = items;
        return this;
    }

    pushItems(items: T[]): this {
        return this.setItems((this.items ?? EMPTY_ARRAY).concat(items));
    }

    shiftItems(items: T[]): this {
        return this.setItems(items.concat(this.items ?? EMPTY_ARRAY));
    }

    findItemIndex(item: T): number {
        if (!this.isFilled()) return -1;

        const { getId, getTime } = this.ctx;

        return this.items.findIndex(
            (_item) => getId(item) === getId(_item) && getTime(item) === getTime(_item),
        );
    }
}

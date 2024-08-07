import type { Opaque } from '@common/types';
import { weakMapGet } from '@common/utils';
import { get } from 'lodash-es';

import { EMPTY_ARRAY } from './const';
import type { RecursiveKeyOf } from './defs';

type CompositeKey<T extends object> = RecursiveKeyOf<T>[];
type TRemovePredicate<T extends object> = (record: T) => boolean;
type TUpsertPredicate<T extends object> = (prev: undefined | T, next: T) => T;
type TUnifierWithCompositeHashKey = Opaque<'Unifier hash key', string>;

const KEY_SEPARATOR = '';

export class UnifierWithCompositeHash<T extends object> {
    static getCachedArray = getCachedArrayFromUnifier;

    public changeIndex = 0;
    private compositeKey: CompositeKey<T>;
    private data = new Map<TUnifierWithCompositeHashKey, T>();

    private removePredicate: TRemovePredicate<T>;
    private upsertPredicate: TUpsertPredicate<T>;

    constructor(
        keys: RecursiveKeyOf<T> | CompositeKey<T>,
        options?: {
            removePredicate?: TRemovePredicate<T>;
            upsertPredicate?: TUpsertPredicate<T>;
        },
    ) {
        this.compositeKey = Array.isArray(keys) ? keys : ([keys] as CompositeKey<T>);
        this.removePredicate = options?.removePredicate ?? (() => false);
        this.upsertPredicate = options?.upsertPredicate ?? ((prev, next) => next);
    }

    clear(): this {
        this.changeIndex++;
        this.data.clear();
        return this;
    }

    /* Modify hash with new dataset.
    Items that are matched by `removeFn` (if present) will be removed from hash.
    Other items will be appended or replaced in the hash. */
    modify = (items: T[]): this => {
        this.changeIndex += items.length > 0 ? 1 : 0;

        for (const item of items) {
            const key = this.getStringKey(item);
            const prev = this.data.get(key);

            if (this.removePredicate(item)) {
                this.data.delete(key);
            } else {
                this.data.set(key, this.upsertPredicate(prev, item));
            }
        }

        return this;
    };

    upsert = (items: T[]): this => {
        this.changeIndex += items.length > 0 ? 1 : 0;

        for (const item of items) {
            const key = this.getStringKey(item);
            const prev = this.data.get(key);

            this.data.set(key, this.upsertPredicate(prev, item));
        }

        return this;
    };

    remove = (items: Partial<T>[]): this => {
        this.changeIndex += items.length > 0 ? 1 : 0;

        for (const item of items) {
            const key = this.getStringKey(item as T);

            this.data.delete(key);
        }

        return this;
    };

    has(item: T): boolean {
        return this.data.has(this.getStringKey(item));
    }

    toArray(): T[] {
        return Array.from(this.data, (item) => item[1]);
    }

    getMap(): ReadonlyMap<string, T> {
        return this.data;
    }

    getSize(): number {
        return this.data.size;
    }

    private getStringKey(item: T): TUnifierWithCompositeHashKey {
        return this.compositeKey
            .map((key: string) => get(item, key))
            .join(KEY_SEPARATOR) as TUnifierWithCompositeHashKey;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new WeakMap<UnifierWithCompositeHash<any>, { changeIndex: number; array: any[] }>();

export function getCachedArrayFromUnifier<T extends object>(
    unifier: UnifierWithCompositeHash<T>,
): T[] {
    const prev = weakMapGet(cache, unifier, () => ({ changeIndex: NaN, array: EMPTY_ARRAY }));

    if (prev.changeIndex !== unifier.changeIndex) {
        prev.changeIndex = unifier.changeIndex;
        prev.array = unifier.toArray();
    }

    return prev.array;
}

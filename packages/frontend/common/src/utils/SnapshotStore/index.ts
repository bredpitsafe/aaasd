import memoizee from 'memoizee';

type TItemsKey = string | number;

export class SnapshotStore<T> {
    private cacheIndex = 0;

    private snapshotMap = new Map<TItemsKey, T>();
    private historyMap = new Map<TItemsKey, T>();

    constructor(
        private getKey: (item: T) => TItemsKey,
        private sortPredicate: (a: T, b: T) => number,
    ) {}

    clear() {
        this.historyMap.clear();
        this.snapshotMap.clear();
        this.getSortedItemsMemoized.clear();
        this.getSortedSliceMemoized.clear();
    }

    getSnapshotSize(): number {
        return this.snapshotMap.size;
    }

    getTotalSize(): number {
        return this.snapshotMap.size + this.historyMap.size;
    }

    isFilledSnapshotSlice(offset: number, count: number): boolean {
        return this.getSnapshotSize() >= offset + count;
    }

    upsertItem(value: T) {
        const key = this.getKey(value);
        if (this.snapshotMap.has(key)) {
            this.updateItemIn(this.snapshotMap, key, value);
        } else if (this.historyMap.has(key)) {
            this.updateItemIn(this.historyMap, key, value);
        } else {
            this.upsertHistoryItem(value);
        }
    }

    deleteItem(value: T) {
        const key = this.getKey(value);
        this.deleteByKey(key);
    }

    deleteByKey(key: TItemsKey) {
        if (this.snapshotMap.has(key)) {
            this.deleteItemFrom(this.snapshotMap, key);
        } else if (this.historyMap.has(key)) {
            this.deleteItemFrom(this.historyMap, key);
        }
    }

    upsertHistoryItem(value: T) {
        this.updateItemIn(this.historyMap, this.getKey(value), value);
    }

    upsertHistoryItems(values: Array<T>) {
        for (let i = 0; i < values.length; i++) {
            this.upsertHistoryItem(values[i]);
        }
    }

    upsertSnapshotItems(values: Array<T>) {
        for (let i = 0; i < values.length; i++) {
            const key = this.getKey(values[i]);
            let value = values[i];

            if (this.historyMap.has(key)) {
                value = this.historyMap.get(key)!;
                this.deleteItemFrom(this.historyMap, key);
            }

            this.updateItemIn(this.snapshotMap, key, value);
        }
    }

    getSlice(offset: number, count: number): Array<T> {
        return this.getSortedSliceMemoized(this.cacheIndex, offset, count);
    }

    private updateCacheIndex() {
        this.cacheIndex = (this.cacheIndex + 1) % Number.MAX_SAFE_INTEGER;
    }

    private updateItemIn(map: Map<TItemsKey, T>, key: TItemsKey, value: T) {
        map.set(key, value);
        this.updateCacheIndex();
    }

    private deleteItemFrom(map: Map<TItemsKey, T>, key: TItemsKey) {
        map.delete(key);
        this.updateCacheIndex();
    }

    private invalidateHistoryItems() {
        const historyKeys = Array.from(this.historyMap.keys());
        const intersection = historyKeys.filter((key) => this.snapshotMap.has(key));

        for (let i = 0; i < intersection.length; i++) {
            this.deleteItemFrom(this.historyMap, intersection[i]);
        }
    }

    private getSortedItemsMemoized = memoizee(
        // first arg just for cache invalidation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (cacheIndex: unknown) => {
            const snapshots = Array.from(this.snapshotMap.values());
            const histories = Array.from(this.historyMap.values());

            return snapshots.concat(histories).sort(this.sortPredicate);
        },
        { primitive: true, max: 1 },
    );

    private getSortedSliceMemoized = memoizee(
        (cacheIndex: number, offset: number, count: number) => {
            return this.getSortedItemsMemoized(cacheIndex).slice(offset, offset + count);
        },
        // few tabs can access the different slices of the same data
        { primitive: true, max: 10 },
    );
}

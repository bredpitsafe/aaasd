import { EMPTY_ARRAY } from '../const';

export class ArrowDiffer<T, K> {
    private prevItems: T[] = [];
    private prevKeys = new Set<K>();
    private mapKeyToItem = new Map<K, T>();

    constructor(private getKey: (item: T, index: number) => K) {}

    nextState(items?: undefined | null | T[]): {
        added: T[];
        updated: T[];
        deleted: T[];
    } {
        items = Array.isArray(items) ? items : EMPTY_ARRAY;

        const { getKey, mapKeyToItem, prevKeys } = this;
        const added: T[] = [];
        const updated: T[] = [];
        const deleted: T[] = [];

        if (items.length === 0 && prevKeys.size === 0) {
            return {
                added,
                updated,
                deleted: deleted,
            };
        }

        if (items.length === 0 && prevKeys.size > 0) {
            const removed = this.prevItems;

            prevKeys.clear();
            mapKeyToItem.clear();
            this.prevItems = [];

            return {
                added,
                updated,
                deleted: removed,
            };
        }

        if (prevKeys.size === 0 && items.length > 0) {
            prevKeys.clear();
            mapKeyToItem.clear();
            items.forEach((item, index) => {
                const key = getKey(item, index);
                prevKeys.add(key);
                mapKeyToItem.set(key, item);
            });
            this.prevItems = items;

            return {
                added: items,
                updated,
                deleted: deleted,
            };
        }

        const nextKeys = new Set<K>();

        items.forEach((item, index) => {
            const key = getKey(item, index);
            const prevItem = mapKeyToItem.get(key);

            nextKeys.add(key);
            mapKeyToItem.set(key, item);

            if (prevItem !== undefined) {
                updated.push(item);
            } else {
                added.push(item);
            }
        });

        prevKeys.forEach((key) => {
            if (!nextKeys.has(key) && mapKeyToItem.has(key)) {
                deleted.push(mapKeyToItem.get(key)!);
                mapKeyToItem.delete(key);
            }
        });

        this.prevKeys = nextKeys;
        this.prevItems = items;

        return {
            added,
            updated,
            deleted: deleted,
        };
    }
}

import RBush, { BBox } from 'rbush';

import { TPart } from '../def';

export class PartsTree<T extends TPart> extends RBush<T> {
    private mapItemIdToSnapshot = new Map<T['id'], T>();

    clear(): RBush<T> {
        this.mapItemIdToSnapshot && this.mapItemIdToSnapshot.clear();
        return super.clear();
    }

    toBBox(item: T): BBox {
        return {
            minX: item.interval[0],
            maxX: item.interval[1],
            minY: item.pixelSize,
            maxY: item.pixelSize,
        };
    }

    compareMinX(a: T, b: T): number {
        return a.interval[0] - b.interval[1];
    }

    compareMinY(a: T, b: T): number {
        return a.pixelSize - b.pixelSize;
    }

    find(timeStart: number, timeEnd: number, pixelSizeMin: number, pixelSizeMax: number): T[] {
        return this.search({
            minX: timeStart,
            maxX: timeEnd,
            minY: pixelSizeMin,
            maxY: pixelSizeMax,
        });
    }

    has(timeStart: number, timeEnd: number, pixelSizeMin: number, pixelSizeMax: number): boolean {
        return this.collides({
            minX: timeStart,
            maxX: timeEnd,
            minY: pixelSizeMin,
            maxY: pixelSizeMax,
        });
    }

    insert(item: T): RBush<T> {
        const prevItem = this.mapItemIdToSnapshot.get(item.id);

        if (prevItem === undefined || this.shouldUpdate(item, prevItem)) {
            prevItem && this.delete(prevItem);
            this.saveSnapshot(item);
            super.insert(item);
        }

        return this;
    }

    delete(item: T): void {
        this.remove(item, (a, b) => a.id === b.id);
        this.deleteSnapshot(item.id);
    }

    deleteById(id: T['id']): void {
        const item = this.mapItemIdToSnapshot.get(id);

        item && this.delete(item);
    }

    private shouldUpdate(a: T, b: T): boolean {
        return (
            a.pixelSize !== b.pixelSize ||
            a.interval[0] !== b.interval[0] ||
            a.interval[1] !== b.interval[1]
        );
    }

    private deleteSnapshot(itemId: T['id']): void {
        this.mapItemIdToSnapshot.delete(itemId);
    }

    private saveSnapshot(item: T): void {
        this.mapItemIdToSnapshot.set(item.id, <T>{
            id: item.id,
            pixelSize: item.pixelSize,
            interval: item.interval.slice(),
        });
    }
}

import nextTick from 'next-tick';

export class Signal<T = unknown, R = unknown> {
    private items: ((data: T) => void)[] = [];
    private destroyItems: ((data?: { reason: R }) => void)[] = [];

    private destroyData?: { reason: R };
    private isDestroyed = false;

    emit(data: T): Signal<T, R> {
        nextTick(() => {
            if (this.isDestroyed) return;
            this.items.forEach((cb) => cb(data));
        });

        return this;
    }

    onEmit(item: (data: T) => void): Signal<T, R> {
        if (this.isDestroyed) return this;

        this.remove(item);
        this.items.push(item);

        return this;
    }

    remove(item: (data: T) => void): Signal<T, R> {
        if (this.isDestroyed) return this;

        const index = this.items.indexOf(item);

        if (index !== -1) {
            this.items.splice(index, 1);
        }

        return this;
    }

    destroy(data?: { reason: R }): void {
        nextTick(() => {
            if (this.isDestroyed) return;

            this.destroyItems.forEach((cb) => cb(data));
            this.destroyData = data;
            this.isDestroyed = true;
            // @ts-ignore
            this.items = null;
            // @ts-ignore
            this.destroyItems = null;
        });
    }

    onDestroy(item: (data?: { reason: R }) => void): Signal<T, R> {
        if (this.isDestroyed) {
            item(this.destroyData);
            return this;
        }

        this.destroyItems.push(item);

        return this;
    }
}

export function createSignal<T = unknown, R = unknown>(): Signal<T, R> {
    return new Signal<T, R>();
}

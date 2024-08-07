import type { Constructor } from '@common/types';
import memoize from 'memoizee';

type Keeper<T> =
    | Array<T>
    | Float32Array
    | Float64Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array;

type KeeperConstructor<T, K> = Constructor<K> & {
    from(list: T[]): K;
};

export class CircularArray<T, K extends Keeper<T> = Keeper<T>> {
    toArray: () => T[];
    toCompactArray: () => T[];

    private index = 0;
    private values: K;

    constructor(
        public size: number,
        private Keeper: KeeperConstructor<T, K> = Array as unknown as KeeperConstructor<T, K>,
    ) {
        this.values = new Keeper(size) as K;

        this.toArray = memoize(
            () => {
                return Keeper.from(
                    (this.index < this.size
                        ? this.values
                        : [
                              ...this.values.slice(this.index % this.size),
                              ...this.values.slice(0, this.index % this.size),
                          ]) as T[],
                );
            },
            {
                max: 1,
                normalizer: () => String(this.index),
            },
        ) as () => T[];

        this.toCompactArray = memoize(
            () => (this.index < this.size ? this.values.slice(0, this.index) : this.toArray()),
            {
                max: 1,
                normalizer: () => String(this.index),
            },
        ) as () => T[];
    }

    push(...values: T[]): void {
        values.forEach((value) => {
            this.values[this.index % this.size] = value;
            this.index += 1;
        });
    }

    clear(): void {
        this.index = 0;
        this.values = new this.Keeper(this.size) as K;
    }
}

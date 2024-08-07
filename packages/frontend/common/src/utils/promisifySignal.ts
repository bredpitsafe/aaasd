import { Defer } from './Defer';
import type { Signal } from './signal';

export function promisifySignal<T, S extends Signal<T>>(signal: S): Promise<T[]> {
    const defer = new Defer<T[]>();
    const items: T[] = [];

    signal
        .onEmit((data: T) => {
            items.push(data);
        })
        .onDestroy(() => {
            defer.resolve(items);
        });

    return defer.promise;
}

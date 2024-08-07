import { useMemo, useSyncExternalStore } from 'react';

import { noop } from '../fn';

export function useSyncPromise<T>(promise: Promise<T>): undefined | T;
export function useSyncPromise<T>(promise: Promise<T>, seed: T): T;
export function useSyncPromise<T>(promise: Promise<T>, seed?: T) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const store = useMemo(() => createStore(promise, seed), [promise]);
    return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

function createStore<T>(promise: Promise<T>, seed?: T) {
    let value = seed;
    let trigger = noop;

    return {
        subscribe(onStoreChange: () => void) {
            trigger = onStoreChange;

            promise.then((v) => {
                value = v;
                trigger();
            });

            return () => (trigger = noop);
        },
        getSnapshot() {
            return value;
        },
    };
}

import { useMemo, useSyncExternalStore } from 'react';

import { noop } from '../fn';

export function useSyncState<T>(seed: T, deps?: unknown[]): [T, (v: T) => void] {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const store = useMemo(() => createStore(seed), deps);
    return [useSyncExternalStore(store.subscribe, store.getSnapshot), store.setValue];
}

function createStore<T>(seed: T) {
    let value = seed;
    let trigger = noop;

    return {
        subscribe(onStoreChange: () => void) {
            trigger = onStoreChange;
            return () => (trigger = noop);
        },
        getSnapshot() {
            return value;
        },
        setValue(v: T) {
            value = v;
            trigger();
        },
    };
}

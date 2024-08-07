import { tapOnce } from '@common/rx';
import { isUndefined } from 'lodash-es';
import { useMemo, useSyncExternalStore } from 'react';
import { useUnmount } from 'react-use';
import type { Observable, Subscription } from 'rxjs';
import { animationFrameScheduler } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { noop } from '../fn';
import { logError } from '../Rx/log';
import { ModuleNotifyError } from '../Rx/ModuleNotify';
import { throwingError } from '../throwingError';
import { loggerReact } from '../Tracing/Children/React';

export function useSyncObservable<T>(obs$: Observable<T>): undefined | T;
export function useSyncObservable<T>(obs$: Observable<T>, seed: T): T;
export function useSyncObservable<T>(obs$: Observable<T>, seed?: T) {
    const store = useMemo(
        () => createStore(obs$.pipe(logError(loggerReact.error)), seed),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [obs$],
    );
    // protect case, when store is not call subscribe + unsubscribe
    useUnmount(store.unsubscribe);
    return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useNotifiedObservable<T>(obs$: Observable<T>): undefined | T;
export function useNotifiedObservable<T>(obs$: Observable<T>, seed: T): T;
export function useNotifiedObservable<T>(obs$: Observable<T>, seed?: T) {
    const notifyError = useModule(ModuleNotifyError);
    return useSyncObservable(
        useMemo(() => obs$.pipe(notifyError()), [obs$, notifyError]),
        seed,
    );
}

export function createStore<T>(obs$: Observable<T>, seed?: T) {
    let value = seed;
    let onChange: VoidFunction = noop;
    const update = (v: T) => {
        value = v;
        onChange();
    };
    const subscribe = () => {
        return obs$.pipe(tapOnce(update), debounceTime(0, animationFrameScheduler)).subscribe({
            next: update,
            error: throwingError,
        });
    };
    const unsubscribe = () => {
        subscription?.unsubscribe();
        onChange = noop;
        value = seed;
    };
    const getSnapshot = () => value;

    let subscription: undefined | Subscription = undefined;

    return {
        subscribe(onStoreChange: () => void) {
            onChange = onStoreChange;
            subscription =
                isUndefined(subscription) || subscription.closed ? subscribe() : subscription;

            if (value !== seed) onChange();

            return unsubscribe;
        },
        unsubscribe,
        getSnapshot,
    };
}

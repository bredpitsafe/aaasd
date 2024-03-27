import { identity, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Milliseconds } from '../../types/time';
import { EMPTY_OBJECT } from '../const';
import { debounceBy } from '../debounceBy';
import { mapGet } from '../map';
import { shareReplayWithDelayedReset, shareReplayWithImmediateReset } from '../Rx/share';
import { shallowHash } from '../shallowHash';
import { macroTasks } from '../TasksScheduler/macroTasks';

type TKey = boolean | number | string;

const defaultNormalizer = <T extends any[]>(args: T): TKey => shallowHash(...args);
const DEFAULT_REMOVE_UNSUBSCRIBED_DELAY = 5_000;

export type TDedobsOptions<Args extends unknown[]> = {
    normalize?: (args: Args) => TKey;
    /**
     * Delay on reset internal cache in shareReplay
     */
    resetDelay?: number;
    /**
     * Delay on remove from bank after ref count equal zero
     */
    removeDelay?: number;
    removeUnsubscribedDelay?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dedobs<Fn extends (...args: any[]) => Observable<any>>(
    fn: Fn,
    options: TDedobsOptions<Parameters<Fn>> = EMPTY_OBJECT,
) {
    const normalize = options.normalize ?? defaultNormalizer;
    const getObsCache = getObsCacheFactory<ReturnType<Fn>>(
        options.resetDelay,
        options.removeDelay,
        options.removeUnsubscribedDelay ?? DEFAULT_REMOVE_UNSUBSCRIBED_DELAY,
    );

    return (...args: Parameters<Fn>): ReturnType<Fn> => {
        return getObsCache(normalize(args), () => fn(...args) as ReturnType<Fn>);
    };
}

export function constantNormalizer() {
    return 0;
}

function getObsCacheFactory<Obs extends Observable<any>>(
    resetDelay: undefined | number,
    removeDelay: undefined | number,
    removeUnsubscribedDelay: number,
) {
    const map = new Map<TKey, { refCount: number; obs: Obs }>();
    const removeIfDerelict = (key: TKey) => {
        const cache = getCache(key);
        if (cache !== undefined && cache.refCount === 0) {
            map.delete(key);
        }
    };
    const removeCache =
        removeDelay === undefined || removeDelay === 0 || !isFinite(removeDelay)
            ? removeIfDerelict
            : debounceBy(removeIfDerelict, ([key]) => ({
                  group: key,
                  delay: removeDelay,
              }));
    const onSubscribe = (key: TKey, cb: VoidFunction) => {
        const cache = getCache(key);
        if (cache !== undefined) {
            cache.refCount++;
            cb();
        }
    };
    const onFinalize = (key: TKey) => {
        const cache = getCache(key);
        if (cache !== undefined) {
            cache.refCount--;
            cache.refCount === 0 && removeCache(key);
        }
    };
    const getCache = (key: TKey) => map.get(key);
    const createCache = (key: TKey, obs: Obs) => {
        // If anyone doesn't sub during some time we remove cache
        const stop = macroTasks.addTimeout(() => removeIfDerelict(key), removeUnsubscribedDelay);

        return {
            refCount: 0,
            obs: obs.pipe(
                resetDelay === undefined
                    ? identity
                    : resetDelay === 0
                      ? shareReplayWithImmediateReset()
                      : shareReplayWithDelayedReset(resetDelay as Milliseconds),
                tap({
                    subscribe: onSubscribe.bind(null, key, stop),
                    finalize: onFinalize.bind(null, key),
                }),
            ) as Obs,
        };
    };

    return (key: TKey, getObs: () => Obs) => {
        return mapGet(map, key, () => createCache(key, getObs())).obs;
    };
}

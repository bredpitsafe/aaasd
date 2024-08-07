import { shareReplayWithDelayedReset, shareReplayWithImmediateReset } from '@common/rx';
import type { Milliseconds } from '@common/types';
import type { TraceId } from '@common/utils';
import { get, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { identity } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EMPTY_OBJECT } from '../const';
import { debounceBy } from '../debounceBy';
import { shallowHash } from '../shallowHash';
import { macroTasks } from '../TasksScheduler/macroTasks';

type TKey = boolean | number | string;

export const DEFAULT_NORMALIZER = <T extends any[]>(args: T): TKey => shallowHash(...args);
const defaultTraceIdGetter = <T extends any[]>(args: T): undefined | TraceId => {
    // in most cases traceId is a part of second argument
    return get(args[1], 'traceId');
};
const DEFAULT_REMOVE_UNSUBSCRIBED_DELAY = 5_000;
export const DEDOBS_SKIP_KEY = Symbol('SKIP_KEY');

export type TDedobsOptions<Args extends unknown[]> = {
    normalize?: (args: Args) => typeof DEDOBS_SKIP_KEY | TKey;
    getTraceId?: (args: Args) => TraceId;
    /**
     * Delay on reset internal cache in shareReplay
     */
    resetDelay?: number;
    replayCount?: number;
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
    const normalize = options.normalize ?? DEFAULT_NORMALIZER;
    const getTraceId = options.getTraceId ?? defaultTraceIdGetter;
    const getObsCache = getObsCacheFactory<ReturnType<Fn>>(
        options.replayCount ?? 1,
        options.resetDelay,
        options.removeDelay,
        options.removeUnsubscribedDelay ?? DEFAULT_REMOVE_UNSUBSCRIBED_DELAY,
    );

    return (...args: Parameters<Fn>): ReturnType<Fn> => {
        const key = normalize(args);
        return key === DEDOBS_SKIP_KEY
            ? (fn(...args) as ReturnType<Fn>)
            : getObsCache(key, () => fn(...args) as ReturnType<Fn>, getTraceId(args));
    };
}

export function constantNormalizer() {
    return 0;
}

function getObsCacheFactory<Obs extends Observable<any>>(
    replayCount: number,
    resetDelay: undefined | number,
    removeDelay: undefined | number,
    removeUnsubscribedDelay: number,
) {
    const mapKeyToCache = new Map<
        TKey,
        { refCount: number; obs: Obs; traceId: undefined | TraceId }
    >();
    const mapTraceIdToSetTraceId = new Map<TraceId, Set<TraceId>>();

    const removeIfDerelict = (key: TKey) => {
        const cache = mapKeyToCache.get(key);
        if (cache !== undefined && cache.refCount === 0) {
            mapKeyToCache.delete(key);
            !isNil(cache.traceId) && mapTraceIdToSetTraceId.delete(cache.traceId);
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
        const cache = mapKeyToCache.get(key);
        if (cache !== undefined) {
            cache.refCount++;
            cb();
        }
    };
    const onFinalize = (key: TKey) => {
        const cache = mapKeyToCache.get(key);
        if (cache !== undefined) {
            cache.refCount--;
            cache.refCount === 0 && removeCache(key);
        }
    };
    const createCache = (key: TKey, obs: Obs, traceId?: TraceId) => {
        // If anyone doesn't sub during some time we remove cache
        const stop = macroTasks.addTimeout(() => removeIfDerelict(key), removeUnsubscribedDelay);

        return {
            refCount: 0,
            obs: obs.pipe(
                resetDelay === undefined
                    ? identity
                    : resetDelay === 0
                      ? shareReplayWithImmediateReset(replayCount)
                      : shareReplayWithDelayedReset(resetDelay as Milliseconds, replayCount),
                tap({
                    subscribe: onSubscribe.bind(null, key, stop),
                    finalize: onFinalize.bind(null, key),
                }),
            ) as Obs,
            traceId,
        };
    };

    return (key: TKey, getObs: () => Obs, traceId: undefined | TraceId) => {
        if (!mapKeyToCache.has(key)) {
            mapKeyToCache.set(key, createCache(key, getObs(), traceId));
        }

        const value = mapKeyToCache.get(key)!;

        if (!isNil(value.traceId) && !mapTraceIdToSetTraceId.has(value.traceId)) {
            mapTraceIdToSetTraceId.set(value.traceId, new Set());
        }

        if (
            !isNil(traceId) &&
            !isNil(value.traceId) &&
            value.traceId !== traceId &&
            !mapTraceIdToSetTraceId.get(value.traceId)?.has(traceId)
        ) {
            mapTraceIdToSetTraceId.get(value.traceId)!.add(traceId);
            /*logger.info(
                `[Dedobs]: traceId ${traceId} reuse observable with traceId ${value.traceId}`,
            );*/
        }

        return value.obs;
    };
}

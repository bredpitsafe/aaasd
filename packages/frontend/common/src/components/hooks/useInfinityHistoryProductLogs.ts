import { useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';
import { exhaustMap, identity, takeWhile, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { EFetchHistoryDirection } from '../../handlers/def';
import type { TProductLog, TProductLogSubscriptionFilters } from '../../handlers/productLogs/defs';
import { ModuleBaseActions } from '../../modules/actions';
import type { TSocketURL } from '../../types/domain/sockets';
import type { ISO, Milliseconds } from '../../types/time';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncState } from '../../utils/React/useSyncState';
import { isSubscriptionEventUpdate, TSubscriptionEvent } from '../../utils/Rx/subscriptionEvents';
import { getNowMilliseconds, toISO } from '../../utils/time';
import { compareDates } from '../../utils/timeCompare';
import { generateTraceId } from '../../utils/traceId';
import {
    TInfinityHistoryItemsFetchProps,
    useInfinityHistoryItems,
} from '../AgTable/hooks/useInfinityHistoryItems';
import { useFetchProductLogs } from './useFetchProductLogs';

export function useInfinityHistoryProductLogs(
    url: TSocketURL,
    filters: TProductLogSubscriptionFilters,
) {
    const { subscribeToProductLogUpdates } = useModule(ModuleBaseActions);

    const [isLive, toggleLive] = useToggle(true);
    const [updateTime, setUpdateTime] = useSyncState<undefined | Milliseconds>(undefined, [
        filters,
    ]);
    const setCurrentUpdateTime = useFunction(() => setUpdateTime(getNowMilliseconds()));
    const fetchProductLogs$ = useFetchProductLogs(url, filters);
    const fetch$ = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TProductLog>) => {
            return fetchProductLogs$({
                limit: params.limit,
                timestamp: params.offset === 0 ? undefined : params.lastRow?.platformTime,
                direction: EFetchHistoryDirection.Backward,
            }).pipe(tap(setCurrentUpdateTime));
        },
        [fetchProductLogs$, setCurrentUpdateTime],
    );
    const subscribe$ = useMemo(() => {
        return isLive && isLiveFilters(filters)
            ? () => {
                  const options = { traceId: generateTraceId() };
                  return timer(300).pipe(
                      exhaustMap(() => subscribeToProductLogUpdates(url, filters, options)),
                      tap(setCurrentUpdateTime),
                      filters.till === undefined
                          ? identity
                          : takeWhileItemsBeforeLimitTime(toISO(filters.till)),
                  );
              }
            : undefined;
    }, [isLive, subscribeToProductLogUpdates, url, filters, setCurrentUpdateTime]);

    const infinityHistory = useInfinityHistoryItems<TProductLog>(
        (v) => v.fingerprint,
        fetch$,
        subscribe$,
    );

    return {
        ...infinityHistory,
        isLive,
        toggleLive,
        updateTime,
    };
}

function isLiveFilters(filters: TProductLogSubscriptionFilters) {
    return (
        filters.till === undefined ||
        filters.till > getNowMilliseconds() ||
        // Backtesting can be running in the past
        filters.backtestingRunId !== undefined
    );
}

function takeWhileItemsBeforeLimitTime<T extends TSubscriptionEvent<TProductLog[]>>(limit: ISO) {
    return takeWhile<T>((event) => {
        // We disable subscription if we have received an event with a timestamp more than filters.till
        if (isSubscriptionEventUpdate(event) && event.payload.length > 0) {
            return compareDates(event.payload.at(-1)!.platformTime, limit) < 0;
        }
        return true;
    });
}

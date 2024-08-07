import type { TSubscriptionEvent } from '@common/rx';
import { isSubscriptionEventUpdate } from '@common/rx';
import type { ISO, Milliseconds } from '@common/types';
import { compareDates, generateTraceId, getNowMilliseconds, toISO } from '@common/utils';
import { useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';
import { exhaustMap, identity, takeWhile, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { EFetchHistoryDirection } from '../../modules/actions/def.ts';
import type {
    TProductLog,
    TProductLogSubscriptionFilters,
} from '../../modules/actions/productLogs/defs.ts';
import { ModuleSubscribeToProductLogUpdates } from '../../modules/actions/productLogs/subscribeToProductLogs.ts';
import type { TSocketURL } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncState } from '../../utils/React/useSyncState';
import { ModuleNotifyErrorAndFail } from '../../utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import type { TInfinityHistoryItemsFetchProps } from '../AgTable/hooks/useInfinityHistoryItems';
import { useInfinityHistoryItems } from '../AgTable/hooks/useInfinityHistoryItems';
import { useFetchProductLogs } from './useFetchProductLogs';

export function useInfinityHistoryProductLogs(
    target: TSocketURL,
    filters: TProductLogSubscriptionFilters,
) {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    const subscribeToProductLogUpdates = useModule(ModuleSubscribeToProductLogUpdates);

    const [isLive, toggleLive] = useToggle(true);
    const [updateTime, setUpdateTime] = useSyncState<undefined | Milliseconds>(undefined, [
        filters,
    ]);
    const setCurrentUpdateTime = useFunction(() => setUpdateTime(getNowMilliseconds()));
    const fetchProductLogs$ = useFetchProductLogs(target, filters);
    const fetch = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TProductLog>) => {
            return fetchProductLogs$({
                limit: params.limit,
                timestamp: params.offset === 0 ? undefined : params.lastRow?.platformTime,
                direction: EFetchHistoryDirection.Backward,
            }).pipe(
                notifyErrorAndFail(),
                extractSyncedValueFromValueDescriptor(),
                tap(setCurrentUpdateTime),
            );
        },
        [fetchProductLogs$, notifyErrorAndFail, setCurrentUpdateTime],
    );
    const subscribe = useMemo(() => {
        return isLive && isLiveFilters(filters)
            ? () => {
                  return timer(300).pipe(
                      exhaustMap(() =>
                          subscribeToProductLogUpdates(
                              { target, filters },
                              { traceId: generateTraceId() },
                          ),
                      ),
                      notifyErrorAndFail(),
                      extractSyncedValueFromValueDescriptor(),
                      tap(setCurrentUpdateTime),
                      filters.till === undefined
                          ? identity
                          : takeWhileItemsBeforeLimitTime(toISO(filters.till)),
                  );
              }
            : undefined;
    }, [
        target,
        isLive,
        filters,
        notifyErrorAndFail,
        setCurrentUpdateTime,
        subscribeToProductLogUpdates,
    ]);

    const infinityHistory = useInfinityHistoryItems<TProductLog>(
        (v) => v.fingerprint,
        fetch,
        subscribe,
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

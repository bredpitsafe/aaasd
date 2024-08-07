import type { Milliseconds, TimeZone } from '@common/types';
import { generateTraceId, getNowMilliseconds } from '@common/utils';
import type { TInfinityHistoryItemsFetchProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useInfinityHistoryItems } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { EMPTY, exhaustMap, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ModuleSubscribeToOwnTradesUpdates } from '../modules/actions/ModuleSubscribeToOwnTradesUpdates.ts';
import { useFetchOwnTrades } from './useFetchOwnTrades';

dayjs.extend(isToday);

export function useInfinityHistoryOwnTrades(filters: TDailyStatsFilter, timeZone: TimeZone) {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    const subscribeToOwnTradesUpdates = useModule(ModuleSubscribeToOwnTradesUpdates);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);

    const url = useSyncObservable(currentSocketStruct$);
    const [isLive, toggleLive] = useToggle(true);
    const [tableFilter, setTableFilter] = useState<undefined | TOwnTradeFilter>(undefined);
    const canBeLive = useMemo(() => {
        const isTableFilter =
            tableFilter?.platformTime?.till !== undefined ||
            tableFilter?.platformTime?.since !== undefined;

        if (isTableFilter) {
            const till = tableFilter?.platformTime?.till;
            return till === undefined || dayjs(till).isAfter(dayjs());
        } else {
            return dayjs(filters.date).isToday();
        }
    }, [tableFilter, filters.date]);

    const [updateTime, setUpdateTime] = useSyncState<undefined | Milliseconds>(undefined, [
        filters,
        timeZone,
    ]);
    const setCurrentUpdateTime = useFunction(() => setUpdateTime(getNowMilliseconds()));
    const fetchOwnTrades$ = useFetchOwnTrades(filters, timeZone);
    const fetch$ = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TOwnTrade, TOwnTradeFilter>) => {
            setTableFilter(params.filter);

            return isNil(url)
                ? EMPTY
                : fetchOwnTrades$(url, params).pipe(
                      notifyErrorAndFail(),
                      extractSyncedValueFromValueDescriptor(),
                      tap(setCurrentUpdateTime),
                  );
        },
        [url, fetchOwnTrades$, notifyErrorAndFail, setCurrentUpdateTime],
    );
    const subscribe$ = useMemo(() => {
        return canBeLive && isLive
            ? () => {
                  const options = { traceId: generateTraceId() };
                  // Remove timer after fix buf https://github.com/AStaroverov/actorr/issues/3
                  return timer(300).pipe(
                      exhaustMap(() =>
                          isNil(url)
                              ? EMPTY
                              : subscribeToOwnTradesUpdates(
                                    {
                                        target: url,
                                        filters,
                                        params: { timeZone },
                                    },
                                    options,
                                ),
                      ),
                      notifyErrorAndFail(),
                      extractSyncedValueFromValueDescriptor(),
                      tap(setCurrentUpdateTime),
                  );
              }
            : undefined;
    }, [
        canBeLive,
        isLive,
        notifyErrorAndFail,
        setCurrentUpdateTime,
        url,
        subscribeToOwnTradesUpdates,
        filters,
        timeZone,
    ]);

    const infinityHistory = useInfinityHistoryItems<TOwnTrade, TOwnTradeFilter>(
        (v) => v.tradeId,
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

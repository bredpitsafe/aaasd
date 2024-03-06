import {
    TInfinityHistoryItemsFetchProps,
    useInfinityHistoryItems,
} from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import type { Milliseconds, TimeZone } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { exhaustMap, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ModuleTradingStatsActions } from '../modules/actions/module';
import { useFetchOwnTrades } from './useFetchOwnTrades';

dayjs.extend(isToday);

export function useInfinityHistoryOwnTrades(filters: TDailyStatsFilter, timeZone: TimeZone) {
    const { subscribeToOwnTradesUpdates } = useModule(ModuleTradingStatsActions);

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

            return fetchOwnTrades$(params).pipe(tap(setCurrentUpdateTime));
        },
        [fetchOwnTrades$, setCurrentUpdateTime],
    );
    const subscribe$ = useMemo(() => {
        return canBeLive && isLive
            ? () => {
                  const options = { traceId: generateTraceId() };
                  // Remove timer after fix buf https://github.com/AStaroverov/actorr/issues/3
                  return timer(300).pipe(
                      exhaustMap(() => subscribeToOwnTradesUpdates(filters, timeZone, options)),
                      tap(setCurrentUpdateTime),
                  );
              }
            : undefined;
    }, [canBeLive, isLive, setCurrentUpdateTime, subscribeToOwnTradesUpdates, filters, timeZone]);

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

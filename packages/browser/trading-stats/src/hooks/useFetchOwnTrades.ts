import type { TInfinityHistoryItemsFetchProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import { EFetchHistoryDirection } from '@frontend/common/src/handlers/def';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import type { Milliseconds, TimeZone } from '@frontend/common/src/types/time';
import { getNowISO, toISO } from '@frontend/common/src/utils/time';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { useCallback } from 'react';

import { ModuleTradingStatsActions } from '../modules/actions/module';

export function useFetchOwnTrades(filter: TDailyStatsFilter, timeZone: TimeZone) {
    const { fetchOwnTrades } = useModule(ModuleTradingStatsActions);

    return useCallback(
        (params: TInfinityHistoryItemsFetchProps<TOwnTrade, TOwnTradeFilter>) => {
            const traceId = generateTraceId();
            const isTop = params.offset === 0;
            const tableTill = params.filter.platformTime?.till; // in UTC
            const tableSince = params.filter.platformTime?.since; // in UTC
            const timestamp = isTop
                ? tableTill === undefined
                    ? getNowISO()
                    : tableTill
                : params.lastRow?.platformTime;
            const timestampBound = tableSince === undefined ? toISO(0 as Milliseconds) : tableSince;

            if (timestamp === undefined) {
                const message = `[useFetchOwnTrades] timestamp cannot be empty`;

                logger.error(message, {
                    params,
                    filter,
                    traceId,
                });
                throw new Error(message);
            }

            logger.trace(`[useFetchOwnTrades] call`, { params, filter, traceId });

            return fetchOwnTrades(
                {
                    limit: params.limit,
                    timestamp,
                    timestampBound,
                    direction: EFetchHistoryDirection.Backward,
                },
                {
                    exclude: filter.exclude,
                    include: filter.include,
                    backtestingId: filter.backtestingId,
                },
                timeZone,
                { traceId },
            );
        },
        [filter, fetchOwnTrades, timeZone],
    );
}

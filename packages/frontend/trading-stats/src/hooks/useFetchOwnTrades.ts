import type { Milliseconds, TimeZone } from '@common/types';
import { generateTraceId, getNowISO, toISO } from '@common/utils';
import type { TInfinityHistoryItemsFetchProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import { EFetchHistoryDirection } from '@frontend/common/src/modules/actions/def.ts';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import type { TSocketStruct } from '@frontend/common/src/types/domain/sockets.ts';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import { logger } from '@frontend/common/src/utils/Tracing';
import { useCallback } from 'react';

import { ModuleFetchOwnTrades } from '../modules/actions/ModuleFetchOwnTrades.ts';

export function useFetchOwnTrades(filters: TDailyStatsFilter, timeZone: TimeZone) {
    const fetchOwnTrades = useModule(ModuleFetchOwnTrades);

    return useCallback(
        (
            url: TSocketStruct,
            params: TInfinityHistoryItemsFetchProps<TOwnTrade, TOwnTradeFilter>,
        ) => {
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
                    filters,
                    traceId,
                });
                throw new Error(message);
            }

            logger.trace(`[useFetchOwnTrades] call`, { params, filters, traceId });

            return fetchOwnTrades(
                {
                    target: url,
                    params: {
                        timeZone,
                        limit: params.limit,
                        timestamp,
                        timestampBound,
                        direction: EFetchHistoryDirection.Backward,
                    },
                    filters: {
                        exclude: filters.exclude,
                        include: filters.include,
                        backtestingId: filters.backtestingId,
                    },
                },
                { traceId },
            );
        },
        [filters, fetchOwnTrades, timeZone],
    );
}

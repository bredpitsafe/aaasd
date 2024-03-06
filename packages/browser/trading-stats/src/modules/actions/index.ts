import type { TContextRef } from '@frontend/common/src/di';
import { subscribeTradingStatsDailyHandle } from '@frontend/common/src/handlers/tradingStats/subscribeTradingStatsDailyHandle';
import { subscribeTradingStatsMonthlyHandle } from '@frontend/common/src/handlers/tradingStats/subscribeTradingStatsMonthlyHandle';
import type { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { DEFAULT_RETRY_DELAY } from '@frontend/common/src/modules/actions/defs';
import { ModuleCommunicationHandlers } from '@frontend/common/src/modules/communicationHandlers';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type {
    TBalanceStatDaily,
    TBaseAssetStat,
    TDailyStats,
    TDailyStatsFilter,
    TExchangeStat,
    TMonthlyStats,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import type { Observable } from 'rxjs';
import { concat, of, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

export function subscribeTradingStatsDaily(
    ctx: TContextRef,
    url: TSocketURL,
    filter: TDailyStatsFilter,
    timeZone: TimeZone,
): Observable<TDailyStats | undefined | SocketStreamError> {
    const { requestStream } = ModuleCommunicationHandlers(ctx);
    const { error } = ModuleNotifications(ctx);

    const hashes = {
        balanceStats: new UnifierWithCompositeHash<TBalanceStatDaily>(['strategy', 'assetId']),
        baseAssetStats: new UnifierWithCompositeHash<TBaseAssetStat>(['strategy', 'assetId']),
        exchangeStats: new UnifierWithCompositeHash<TExchangeStat>(['strategy', 'exchangeName']),
    };

    return subscribeTradingStatsDailyHandle(requestStream, url, {
        ...filter,
        timeZone,
    }).pipe(
        tap({
            error: (err: SocketStreamError) => {
                error({
                    message: `Daily trading stats subscription failed`,
                    description: err.message,
                    timestamp: getNowMilliseconds(),
                    traceId: err.traceId,
                });
            },
        }),
        map((envelope) => {
            if (envelope.payload.isSnapshot) {
                hashes.balanceStats.clear();
                hashes.exchangeStats.clear();
                hashes.baseAssetStats.clear();
            }

            hashes.balanceStats.modify(envelope.payload.balanceStats);
            hashes.exchangeStats.modify(envelope.payload.exchangeStats);
            hashes.baseAssetStats.modify(envelope.payload.baseAssetStats);

            return {
                balanceStats: hashes.balanceStats.toArray(),
                exchangeStats: hashes.exchangeStats.toArray(),
                baseAssetStats: hashes.baseAssetStats.toArray(),
            };
        }),
        catchError((error: SocketStreamError, caught) =>
            concat(of(error), timer(DEFAULT_RETRY_DELAY).pipe(switchMap(() => caught))),
        ),
        finalize(() => {
            Object.values(hashes).forEach((hash) => hash.clear());
        }),
    );
}

export function subscribeTradingStatsMonthly(
    ctx: TContextRef,
    url: TSocketURL,
    filter: TMonthlyStatsFilter,
    timeZone: TimeZone,
): Observable<TMonthlyStats | SocketStreamError> {
    const { requestStream } = ModuleCommunicationHandlers(ctx);
    const { error } = ModuleNotifications(ctx);

    return subscribeTradingStatsMonthlyHandle(requestStream, url, {
        ...filter,
        timeZone,
    }).pipe(
        tap({
            error: (err: SocketStreamError) => {
                error({
                    message: `Daily trading stats subscription failed`,
                    description: err.message,
                    timestamp: getNowMilliseconds(),
                    traceId: err.traceId,
                });
            },
        }),
        map((envelope) => envelope.payload),
        catchError((error: SocketStreamError, caught) =>
            concat(of(error), timer(DEFAULT_RETRY_DELAY).pipe(switchMap(() => caught))),
        ),
    );
}

import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TStreamHandler } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { TMonthlyStats, TMonthlyStatsFilter } from '../../types/domain/tradingStats';
import { TimeZone } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { THandlerStreamOptions, TRequestStreamOptions } from '../def';
import { getTraceId, pollIntervalForRequest, timeZone2TradingStatsTimeZone } from '../utils';

type TSendBody =
    | ({
          type: 'GetTradingStatsMonth';
      } & TRequestStreamOptions &
          Omit<TMonthlyStatsFilter, 'backtestingId'> & { timezone: string; btRunNo?: number })
    | { type: 'Unsubscribe' };

type TReceiveBody = TMonthlyStats & { isSnapshot: boolean };

export function subscribeTradingStatsMonthlyHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    request: TMonthlyStatsFilter & { timeZone: TimeZone },
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeTradingStatsMonthlyHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => {
            return [
                {
                    type: 'GetTradingStatsMonth',
                    from: request.from,
                    to: request.to,
                    timezone: timeZone2TradingStatsTimeZone(request.timeZone),
                    exclude: request.exclude,
                    include: request.include,
                    btRunNo: request.backtestingId,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    );
}

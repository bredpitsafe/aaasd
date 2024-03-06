import { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TStreamHandler } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { TDailyStats, TDailyStatsFilter } from '../../types/domain/tradingStats';
import { TimeZone } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { THandlerStreamOptions, TRequestStreamOptions, TSubscribed, TWithSnapshot } from '../def';
import {
    buildResponseWithEmptySnapshot,
    convertSubscribedToEmptyUpdate,
    getTraceId,
    pollIntervalForRequest,
    timeZone2TradingStatsTimeZone,
} from '../utils';

type TSendBody =
    | ({
          type: 'SubscribeToTradingStatsDaily';
      } & TRequestStreamOptions &
          Omit<TDailyStatsFilter, 'backtestingId'> & { timezone: string; btRunNo?: number })
    | { type: 'Unsubscribe' };

type TReceiveBody = TWithSnapshot & TDailyStats & { type: 'TradingStatsDaily' };

export function subscribeTradingStatsDailyHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    request: TDailyStatsFilter & { timeZone: TimeZone },
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeTradingStatsDailyHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToTradingStatsDaily',
                    date: request.date,
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
    ).pipe(
        convertSubscribedToEmptyUpdate<TReceiveBody>(() =>
            buildResponseWithEmptySnapshot({
                type: 'TradingStatsDaily',
                balanceStats: [],
                exchangeStats: [],
                baseAssetStats: [],
            }),
        ),
    );
}

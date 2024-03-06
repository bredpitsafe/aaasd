import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TStreamHandler } from '../../modules/communicationHandlers/def';
import { TBacktestingRun } from '../../types/domain/backtestings';
import type { TOwnTrade } from '../../types/domain/ownTrades';
import { TTradeFilterParams } from '../../types/domain/ownTrades';
import { TSocketURL } from '../../types/domain/sockets';
import type { TimeZone } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { THandlerStreamOptions, TRequestStreamOptions, TSubscribed, TWithSnapshot } from '../def';
import { pollIntervalForRequest, timeZone2TradingStatsTimeZone } from '../utils';

type TServerSubscribeToOwnTradesFilter = {
    date: string;
    timezone: string;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
    btRunNo?: number;
};

type TSendBody =
    | (TServerSubscribeToOwnTradesFilter &
          TRequestStreamOptions & {
              type: 'SubscribeToOwnTrades';
          })
    | { type: 'Unsubscribe' };

type TReceiveBody = TSubscribed | (TWithSnapshot & { type: 'OwnTrades'; ownTrades: TOwnTrade[] });

export type TSubscribeToOwnTradesFilter = Omit<TServerSubscribeToOwnTradesFilter, 'btRunNo'> & {
    backtestingId?: TBacktestingRun['btRunNo'];
};

export function subscribeToOwnTradesHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    filter: Omit<TSubscribeToOwnTradesFilter, 'timezone'> & { timeZone: TimeZone },
    options: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[subscribeTradingStatsOwnTradesHandle]', {
        url,
        filter,
        options,
    });

    return handler<TSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToOwnTrades',
                    date: filter.date,
                    timezone: timeZone2TradingStatsTimeZone(filter.timeZone),
                    exclude: filter.exclude,
                    include: filter.include,
                    btRunNo: filter.backtestingId,
                    updatesOnly: options?.updatesOnly ?? false,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        options,
    );
}

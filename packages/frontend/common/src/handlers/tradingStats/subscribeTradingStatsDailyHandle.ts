import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TReceivedData } from '../../lib/BFFSocket/def';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import type { Assign } from '../../types';
import type { TAsset, TAssetId } from '../../types/domain/asset.ts';
import type { TSocketURL } from '../../types/domain/sockets';
import {
    EEntityKind,
    TBalanceStatDaily,
    TDailyStats,
    TDailyStatsFilter,
} from '../../types/domain/tradingStats';
import type { TimeZone } from '../../types/time';
import { logger } from '../../utils/Tracing';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../def';
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

    return handler<
        TSendBody,
        | Assign<
              TReceiveBody,
              {
                  balanceStats: (TBalanceStatDaily & {
                      assetId: TAssetId;
                      assetName: TAsset['name'];
                  })[];
              }
          >
        | TSubscribed
    >(
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
        map((response) =>
            'type' in response.payload && response.payload.type !== 'Subscribed'
                ? {
                      ...response,
                      payload: {
                          ...response.payload,
                          balanceStats: response.payload.balanceStats.map(
                              ({
                                  assetId,
                                  assetName,
                                  assetOrInstrumentId,
                                  assetOrInstrumentName,
                                  entityKind,
                                  ...rest
                              }) =>
                                  ({
                                      ...rest,
                                      assetOrInstrumentId: assetOrInstrumentId ?? assetId,
                                      assetOrInstrumentName: assetOrInstrumentName ?? assetName,
                                      entityKind: entityKind ?? EEntityKind.Asset,
                                  }) as TBalanceStatDaily,
                          ),
                      },
                  }
                : response,
        ),
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

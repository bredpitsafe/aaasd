import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import { TBacktestingRun } from '../../types/domain/backtestings';
import { TTradeFilterParams } from '../../types/domain/ownTrades';
import { TSocketURL } from '../../types/domain/sockets';
import { Nanoseconds } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { TFetchHistoryParams, THandlerStreamOptions, TServerFetchHistoryParams } from '../def';
import { logLargeExcessSoftLimitOperator } from '../utils';

type TServerFetchOwnTradesFilters = {
    btRunNo?: number;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
};

type TSendBody = {
    type: 'FetchOwnTrades';
    params: TServerFetchHistoryParams;
    filters?: TServerFetchOwnTradesFilters;
};

type TReceiveBody = {
    checkedIntervalEnd: Nanoseconds;
    checkedIntervalStart: Nanoseconds;
    ownTrades: [];
};

export type TFetchOwnTradesFilters = Omit<TServerFetchOwnTradesFilters, 'btRunNo'> & {
    backtestingId?: TBacktestingRun['btRunNo'];
};

export function fetchOwnTradesHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    params: TFetchHistoryParams,
    filters: TFetchOwnTradesFilters,
    options: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchOwnTradesHandle]', {
        url,
        params,
        filters,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchOwnTrades',
            params: {
                limit: undefined,
                softLimit: params.limit,
                direction: params.direction,
                platformTime: params.timestamp,
                platformTimeExcluded: params.timestampExcluded,
                platformTimeBound: params.timestampBound,
                platformTimeBoundExcluded: params.timestampBoundExcluded,
            },
            filters: {
                ...filters,
                btRunNo: filters?.backtestingId,
            },
        },
        options,
    ).pipe(
        logLargeExcessSoftLimitOperator(
            params.limit,
            (envelope) => envelope.payload.ownTrades.length,
        ),
    );
}

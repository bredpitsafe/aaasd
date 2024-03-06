import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { tryFixFingerprints } from '../../modules/actions/productLogs/utils';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { Nanoseconds } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { TFetchHistoryParams, TServerFetchHistoryParams } from '../def';
import { getTraceId, logLargeExcessSoftLimitOperator } from '../utils';
import { TProductLog, TProductLogFilters, TServerProductLogFilters } from './defs';

type TSendBody = {
    type: 'FetchProductLog';
    params: TServerFetchHistoryParams;
    filters: TServerProductLogFilters;
};

type TReceiveBody = {
    productLog: TProductLog[];
    checkedIntervalStart: Nanoseconds;
    checkedIntervalEnd: Nanoseconds;
};

export function fetchProductLogsHandler(
    handler: TFetchHandler,
    url: TSocketURL,
    params: TFetchHistoryParams,
    filters: TProductLogFilters,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[fetchProductLogsHandler]', {
        traceId,
        params,
        filters,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchProductLog',
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
                btRunNo: filters.backtestingRunId,
                include: {
                    level: filters.include?.level,
                    actorKey: filters.include?.actorKey,
                    actorGroup: filters.include?.actorGroup,
                    messageContains: filters.include?.message,
                },
                exclude: {
                    actorKey: filters.exclude?.actorKey,
                    actorGroup: filters.exclude?.actorGroup,
                    messageContains: filters.exclude?.message,
                },
            },
        },
        options,
    ).pipe(
        logLargeExcessSoftLimitOperator(
            params.limit,
            (envelope) => envelope.payload.productLog.length,
        ),
        map((envelope) => {
            tryFixFingerprints(envelope.payload.productLog);
            return envelope;
        }),
    );
}

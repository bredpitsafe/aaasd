import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { tryFixFingerprints } from '../../modules/actions/productLogs/utils';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import type { TSocketURL } from '../../types/domain/sockets';
import type { ISO } from '../../types/time';
import { getNowMilliseconds, milliseconds2iso } from '../../utils/time';
import { logger } from '../../utils/Tracing';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TUnsubscribeSendBody,
    TWithSnapshot,
} from '../def';
import { pollIntervalForRequest } from '../utils';
import type { EProductLogLevel, TProductLog, TProductLogSubscriptionFilters } from './defs';

export type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToProductLogs';

    btRunNo?: number;

    since?: ISO;
    till?: ISO;

    levelIncl?: EProductLogLevel[];

    actorKeyIncl?: string[];
    actorKeyExcl?: string[];

    actorGroupIncl?: string[];
    actorGroupExcl?: string[];

    messageContains?: string[];
    messageNotContains?: string[];
};

type TReceiveBody =
    | TSubscribed
    | (TWithSnapshot & {
          type: 'ProductLogRecordUpdates';
          updates: TProductLog[];
      });

export function subscribeToProductLogsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    filters: TProductLogSubscriptionFilters,
    options: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[subscribeToProductLogsHandle]: init observable', {
        url,
        filters,
        options,
    });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToProductLogs',

                    btRunNo: filters.backtestingRunId,

                    since: milliseconds2iso(filters.since ?? getNowMilliseconds()),
                    till: filters.till === undefined ? undefined : milliseconds2iso(filters.till),

                    levelIncl: filters.include?.level,

                    actorKeyIncl: filters.include?.actorKey,
                    actorKeyExcl: filters.exclude?.actorKey,

                    actorGroupIncl: filters.include?.actorGroup,
                    actorGroupExcl: filters.exclude?.actorGroup,

                    messageContains: filters.include?.message,
                    messageNotContains: filters.exclude?.message,

                    updatesOnly: options?.updatesOnly ?? false,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        options,
    ).pipe(
        map((envelope) => {
            if (envelope.payload.type === 'ProductLogRecordUpdates') {
                tryFixFingerprints(envelope.payload.updates);
            }
            return envelope;
        }),
    );
}

import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TStreamHandler } from '../modules/communicationHandlers/def';
import type { TComponentId } from '../types/domain/component';
import type { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import type {
    TComponentConfig,
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TUnsubscribeSendBody,
} from './def';
import { filterOutSubscribedMessage, getTraceId, pollIntervalForRequest } from './utils';

type TSendBody<TId extends TComponentId> = TRequestStreamOptions & {
    type: 'SubscribeToComponentConfigUpdates';
    componentId: TId;
    lastDigest: string | null;
};

type TComponentConfigSame = Omit<TComponentConfig, 'config'> & {
    config: TComponentConfig['config'] | null;
};

type TReceiveBody = TComponentConfig | TComponentConfigSame;

export function subscribeComponentConfigUpdatesHandle<TId extends TComponentId>(
    handler: TStreamHandler,
    url: TSocketURL,
    componentId: TId,
    lastDigest: string | null,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeComponentConfigUpdatesHandle]: init', { traceId });

    return handler<TSendBody<TId> | TUnsubscribeSendBody, TComponentConfig | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToComponentConfigUpdates',
                    componentId,
                    lastDigest,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    ).pipe(filterOutSubscribedMessage<TReceiveBody>());
}

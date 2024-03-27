import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TStreamHandler } from '../modules/communicationHandlers/def';
import type { TVirtualAccount } from '../types/domain/account';
import type { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TUnsubscribeSendBody,
} from './def';
import { convertSubscribedToEmptyUpdate, getTraceId, pollIntervalForRequest } from './utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToVirtualAccounts';
};

type TReceiveBody = {
    type: 'VirtualAccountUpdates';
    virtualAccounts: TVirtualAccount[];
};

export function subscribeVirtualAccountsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeVirtualAccountsHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToVirtualAccounts',
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    ).pipe(
        convertSubscribedToEmptyUpdate<TReceiveBody>(() => ({
            type: 'VirtualAccountUpdates',
            virtualAccounts: [],
        })),
    );
}

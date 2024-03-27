import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import type { TActiveOrder } from '../../types/domain/orders';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TSubscribed, TWithSnapshot } from '../def';
import { getTraceId, pollIntervalForRequest } from '../utils';
import { TOrdersSnapshotFilters } from './fetchOrdersSnapshotHandle';

export type TOrdersSubscriptionFilters = Omit<TOrdersSnapshotFilters, 'statuses'>;

type TSubSendBody = {
    type: 'SubscribeToActiveOrders';
} & TOrdersSubscriptionFilters;

type TUnsubSendBody = {
    type: 'Unsubscribe';
};

type TReceiveBody =
    | TSubscribed
    | (TWithSnapshot & {
          type: 'Orders';
          orders: TActiveOrder[];
      });

type TSendBody = TSubSendBody | TUnsubSendBody;

export function subscribeToOrdersHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    request: TOrdersSubscriptionFilters,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeToOrdersHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToActiveOrders',
                    ...request,
                    // if updatesOnly is false, then server will apply special filters. It deprecated behavior
                    updatesOnly: options?.updatesOnly ?? false,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    );
}

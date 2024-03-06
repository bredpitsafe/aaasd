import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import type { TStorageDashboardListItem } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TRequestStreamOptions, TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToDashboardsList';
};

type TReceiveBody = {
    type: 'DashboardsList';
    list: TStorageDashboardListItem[];
};

export function subscribeToDashboardsListHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeToDashboardsListHandle]: init observable', { traceId });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        () => [{ type: 'SubscribeToDashboardsList' }, { type: 'Unsubscribe' }],
        { ...options, traceId },
    );
}

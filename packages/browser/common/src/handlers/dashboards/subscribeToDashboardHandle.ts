import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import type { TStorageDashboard, TStorageDashboardId } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TRequestStreamOptions, TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToDashboard';
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'Dashboard';
    dashboard: TStorageDashboard;
};

export function subscribeToDashboardHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeToDashboardHandle]: init observable', { traceId, id });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        () => [{ type: 'SubscribeToDashboard', id }, { type: 'Unsubscribe' }],
        { ...options, traceId },
    );
}

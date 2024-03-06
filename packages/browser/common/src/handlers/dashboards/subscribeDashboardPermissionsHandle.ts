import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { THandlerOptions, TStreamHandler } from '../../modules/communicationHandlers/def';
import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { TRequestStreamOptions, TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToDashboardPermissions';
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'DashboardPermissionsList';
    list: TStorageDashboardPermission[];
};

export function subscribeDashboardPermissionsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeDashboardPermissionsHandle]: init observable', { traceId, url, id });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        () => [{ type: 'SubscribeToDashboardPermissions', id }, { type: 'Unsubscribe' }],
        { ...options, traceId },
    );
}

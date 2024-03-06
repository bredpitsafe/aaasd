import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'RenameDashboard';
    id: TStorageDashboardId;
    name: TStorageDashboardName;
};

type TReceiveBody = {
    type: 'DashboardRenamed';
};

export function renameDashboardHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    name: TStorageDashboardName,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[renameDashboardHandle]: init observable', { traceId, url });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'RenameDashboard',
            id,
            name,
        },
        { ...options, traceId },
    );
}

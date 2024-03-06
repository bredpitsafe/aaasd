import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'FetchDashboardConfig';
    id: TStorageDashboardId;
    digest: string;
};

type TReceiveBody = {
    type: 'DashboardConfig';
    config: TStorageDashboardConfig;
};

export function fetchDashboardConfigHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    digest: string,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[fetchDashboardConfigHandle]: init observable', { traceId, url, id });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchDashboardConfig',
            id,
            digest,
        },
        { ...options, traceId },
    );
}

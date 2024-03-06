import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TComponentId } from '../../types/domain/component';
import type { TStorageDashboardId } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'FetchDashboardIdByLegacyId';
    legacyId: TComponentId;
};

type TReceiveBody = {
    type: 'DashboardId';
    id: TStorageDashboardId;
};

export function fetchDashboardIdByLegacyIdHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    legacyId: TComponentId,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[fetchDashboardIdByLegacyIdHandle]: init observable', { traceId, url, legacyId });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchDashboardIdByLegacyId',
            legacyId,
        },
        { ...options, traceId },
    );
}

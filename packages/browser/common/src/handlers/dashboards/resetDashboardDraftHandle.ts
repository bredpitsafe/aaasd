import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TStorageDashboardId } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'ResetDashboardDraft';
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'DashboardDraftReset';
};

export function resetDashboardDraftHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[resetDashboardDraftHandle]: init observable', { traceId, url, id });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'ResetDashboardDraft',
            id,
        },
        { ...options, traceId },
    );
}

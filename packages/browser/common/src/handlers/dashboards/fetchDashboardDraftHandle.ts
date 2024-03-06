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
    type: 'FetchDashboardDraft';
    id: TStorageDashboardId;
    digest: string;
};

type TReceiveBody = {
    type: 'DashboardDraft';
    draft: TStorageDashboardConfig;
};

export function fetchDashboardDraftHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TStorageDashboardId,
    digest: string,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[fetchDashboardDraftHandle]: init observable', { traceId, url, id });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchDashboardDraft',
            id,
            digest,
        },
        { ...options, traceId },
    );
}

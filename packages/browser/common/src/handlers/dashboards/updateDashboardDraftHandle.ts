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
    type: 'UpdateDashboardDraft';
    id: TStorageDashboardId;
    config: TStorageDashboardConfig;
};

type TReceiveBody = {
    type: 'DashboardDraftUpdated';
};

export type TUpdateDashboardDraftProps = {
    url: TSocketURL;
    id: TStorageDashboardId;
    config: TStorageDashboardConfig;
};

export function updateDashboardDraftHandle(
    handler: TFetchHandler,
    props: TUpdateDashboardDraftProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    const { url, ...restProps } = props;

    logger.trace('[updateDashboardDraftHandle]: init observable', {
        traceId,
        url,
        id: restProps.id,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateDashboardDraft',
            ...restProps,
        },
        { ...options, traceId },
    );
}

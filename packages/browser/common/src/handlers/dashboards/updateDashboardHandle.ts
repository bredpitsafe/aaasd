import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    EStorageDashboardStatus,
    TStorageDashboardConfig,
    TStorageDashboardId,
    TStorageDashboardName,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'UpdateDashboard';
    id: TStorageDashboardId;
    name: string;
    config: TStorageDashboardConfig;
    status: EStorageDashboardStatus;
    digest: string;
};

type TReceiveBody = {
    type: 'DashboardUpdated';
};

export type TUpdateDashboardProps = {
    url: TSocketURL;
    id: TStorageDashboardId;
    name: TStorageDashboardName;
    config: TStorageDashboardConfig;
    status: EStorageDashboardStatus;
    digest: string;
};

export function updateDashboardHandle(
    handler: TFetchHandler,
    props: TUpdateDashboardProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    const { url, ...restProps } = props;

    logger.trace('[updateDashboardHandle]: init observable', { traceId, url, id: restProps.id });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateDashboard',
            ...restProps,
        },
        { ...options, traceId },
    );
}

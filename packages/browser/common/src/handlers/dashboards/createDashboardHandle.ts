import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    EStorageDashboardKind,
    EStorageDashboardStatus,
    TStorageDashboardConfig,
    TStorageDashboardId,
    TStorageDashboardName,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'CreateDashboard';
    name: string;
    config: TStorageDashboardConfig;
    kind?: EStorageDashboardKind;
    status?: EStorageDashboardStatus;
    legacyId?: number;
};

type TReceiveBody = {
    type: 'DashboardCreated';
    id: TStorageDashboardId;
};

export type TCreateDashboardProps = {
    url: TSocketURL;
    name: TStorageDashboardName;
    config: TStorageDashboardConfig;
    kind?: EStorageDashboardKind;
    status?: EStorageDashboardStatus;
    legacyId?: number;
};

export function createDashboardHandle(
    handler: TFetchHandler,
    props: TCreateDashboardProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    const { url, ...restProps } = props;

    logger.trace('[createDashboardHandle]: init observable', { traceId, url });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'CreateDashboard',
            ...restProps,
        },
        { ...options, traceId },
    );
}

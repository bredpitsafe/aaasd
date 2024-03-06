import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardId,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'UpdateDashboardShareSettings';
    id: TStorageDashboardId;
    sharePermission: EStorageDashboardSharePermission;
};

type TReceiveBody = {
    type: 'DashboardShareSettingsUpdated';
};

export type TUpdateDashboardShareSettingsProps = {
    url: TSocketURL;
    id: TStorageDashboardId;
    sharePermission: EStorageDashboardSharePermission;
};

export function updateDashboardShareSettingsHandle(
    handler: TFetchHandler,
    props: TUpdateDashboardShareSettingsProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    const { url, ...restProps } = props;

    logger.trace('[updateDashboardShareSettingsHandle]: init observable', {
        traceId,
        url,
        id: restProps.id,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateDashboardShareSettings',
            ...restProps,
        },
        { ...options, traceId },
    );
}

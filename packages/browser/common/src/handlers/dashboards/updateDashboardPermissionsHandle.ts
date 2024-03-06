import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
} from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'UpdateDashboardPermissions';
    id: TStorageDashboardId;
    permissions: TStorageDashboardPermission[];
};

type TReceiveBody = {
    type: 'DashboardPermissionsUpdated';
};

export type TUpdateDashboardPermissionsProps = {
    url: TSocketURL;
    id: TStorageDashboardId;
    permissions: TStorageDashboardPermission[];
};

export function updateDashboardPermissionsHandle(
    handler: TFetchHandler,
    props: TUpdateDashboardPermissionsProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    const { url, ...restProps } = props;

    logger.trace('[updateDashboardPermissionsHandle]: init observable', {
        traceId,
        url,
        id: restProps.id,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateDashboardPermissions',
            ...restProps,
        },
        { ...options, traceId },
    );
}

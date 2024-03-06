import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { subscribeDashboardPermissionsHandle } from '../../../handlers/dashboards/subscribeDashboardPermissionsHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
} from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TSubscribeDashboardPermissionsArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
};

export type TSubscribeDashboardPermissionsReturnType = TStorageDashboardPermission[];

export function subscribeDashboardPermissions(
    ctx: TContextRef,
    props: TSubscribeDashboardPermissionsArguments,
): Observable<TSubscribeDashboardPermissionsReturnType> {
    const { requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    return subscribeDashboardPermissionsHandle(requestStream, props.url, props.id, {
        traceId: props.traceId,
    }).pipe(map((envelope) => envelope.payload.list));
}

import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { deleteDashboardHandle } from '../../../handlers/dashboards/deleteDashboardHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TStorageDashboardId } from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TDeleteDashboardArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
};

export type TDeleteDashboardReturnType = undefined;

export function deleteDashboard(
    ctx: TContextRef,
    props: TDeleteDashboardArguments,
): Observable<TDeleteDashboardReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    return deleteDashboardHandle(update, props.url, props.id, {
        traceId: props.traceId,
    }).pipe(mapTo(undefined));
}

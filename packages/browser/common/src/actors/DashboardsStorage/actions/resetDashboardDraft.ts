import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { resetDashboardDraftHandle } from '../../../handlers/dashboards/resetDashboardDraftHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TStorageDashboardId } from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TResetDashboardDraftArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
};

export type TResetDashboardDraftReturnType = undefined;

export function resetDashboardDraft(
    ctx: TContextRef,
    props: TResetDashboardDraftArguments,
): Observable<TResetDashboardDraftReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    return resetDashboardDraftHandle(update, props.url, props.id, {
        traceId: props.traceId,
    }).pipe(mapTo(undefined));
}

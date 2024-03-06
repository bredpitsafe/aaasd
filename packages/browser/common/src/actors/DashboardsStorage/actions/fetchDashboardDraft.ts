import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { fetchDashboardDraftHandle } from '../../../handlers/dashboards/fetchDashboardDraftHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TFetchDashboardDraftArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
    digest: string;
};

export type TFetchDashboardDraftReturnType = TStorageDashboardConfig;

export function fetchDashboardDraft(
    ctx: TContextRef,
    props: TFetchDashboardDraftArguments,
): Observable<TFetchDashboardDraftReturnType> {
    const { request } = ModuleCommunicationHandlersRemoted(ctx);

    return fetchDashboardDraftHandle(request, props.url, props.id, props.digest, {
        traceId: props.traceId,
    }).pipe(map((envelope) => envelope.payload.draft));
}

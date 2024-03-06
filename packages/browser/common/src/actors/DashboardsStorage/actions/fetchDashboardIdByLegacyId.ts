import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { fetchDashboardIdByLegacyIdHandle } from '../../../handlers/dashboards/fetchDashboardIdByLegacyIdHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TComponentId } from '../../../types/domain/component';
import type { TStorageDashboardId } from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TFetchDashboardIdByLegacyIdArguments = TWithTraceId & {
    url: TSocketURL;
    legacyId: TComponentId;
};

export type TFetchDashboardIdByLegacyIdReturnType = TStorageDashboardId;

export function fetchDashboardIdByLegacyId(
    ctx: TContextRef,
    props: TFetchDashboardIdByLegacyIdArguments,
): Observable<TFetchDashboardIdByLegacyIdReturnType> {
    const { request } = ModuleCommunicationHandlersRemoted(ctx);

    return fetchDashboardIdByLegacyIdHandle(request, props.url, props.legacyId, {
        traceId: props.traceId,
    }).pipe(map((envelope) => envelope.payload.id));
}

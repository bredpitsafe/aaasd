import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { fetchDashboardConfigHandle } from '../../../handlers/dashboards/fetchDashboardConfigHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '../../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TFetchDashboardConfigArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
    digest: string;
};

export type TFetchDashboardConfigReturnType = TStorageDashboardConfig;

export function fetchDashboardConfig(
    ctx: TContextRef,
    props: TFetchDashboardConfigArguments,
): Observable<TFetchDashboardConfigReturnType> {
    const { request } = ModuleCommunicationHandlersRemoted(ctx);

    return fetchDashboardConfigHandle(request, props.url, props.id, props.digest, {
        traceId: props.traceId,
    }).pipe(map((envelope) => envelope.payload.config));
}

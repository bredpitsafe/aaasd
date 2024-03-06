import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    createDashboardHandle,
    TCreateDashboardProps,
} from '../../../handlers/dashboards/createDashboardHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TStorageDashboardId } from '../../../types/domain/dashboardsStorage';
import type { TraceId } from '../../../utils/traceId';

export type TCreateDashboardArguments = TCreateDashboardProps & TWithTraceId;

export type TCreateDashboardReturnType = TStorageDashboardId;

export function createDashboard(
    ctx: TContextRef,
    props: TCreateDashboardProps & { traceId: TraceId },
): Observable<TCreateDashboardReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    const { traceId, ...restProps } = props;

    return createDashboardHandle(update, restProps, {
        traceId,
    }).pipe(map((envelope) => envelope.payload.id));
}

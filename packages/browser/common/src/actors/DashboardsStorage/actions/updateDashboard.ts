import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    TUpdateDashboardProps,
    updateDashboardHandle,
} from '../../../handlers/dashboards/updateDashboardHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';

export type TUpdateDashboardArguments = TUpdateDashboardProps & TWithTraceId;

export type TUpdateDashboardReturnType = undefined;

export function updateDashboard(
    ctx: TContextRef,
    props: TUpdateDashboardArguments,
): Observable<TUpdateDashboardReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    const { traceId, ...restProps } = props;

    return updateDashboardHandle(update, restProps, {
        traceId,
    }).pipe(mapTo(undefined));
}

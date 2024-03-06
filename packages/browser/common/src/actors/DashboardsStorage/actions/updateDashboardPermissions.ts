import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    TUpdateDashboardPermissionsProps,
    updateDashboardPermissionsHandle,
} from '../../../handlers/dashboards/updateDashboardPermissionsHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';

export type TUpdateDashboardPermissionsArguments = TUpdateDashboardPermissionsProps & TWithTraceId;

export type TUpdateDashboardPermissionsReturnType = undefined;

export function updateDashboardPermissions(
    ctx: TContextRef,
    props: TUpdateDashboardPermissionsArguments,
): Observable<TUpdateDashboardPermissionsReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    const { traceId, ...restProps } = props;

    return updateDashboardPermissionsHandle(update, restProps, {
        traceId,
    }).pipe(mapTo(undefined));
}

import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    TUpdateDashboardShareSettingsProps,
    updateDashboardShareSettingsHandle,
} from '../../../handlers/dashboards/updateDashboardShareSettingsHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';

export type TUpdateDashboardShareSettingsArguments = TUpdateDashboardShareSettingsProps &
    TWithTraceId;

export type TUpdateDashboardShareSettingsReturnType = undefined;

export function updateDashboardShareSettings(
    ctx: TContextRef,
    props: TUpdateDashboardShareSettingsArguments,
): Observable<TUpdateDashboardShareSettingsReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    const { traceId, ...restProps } = props;

    return updateDashboardShareSettingsHandle(update, restProps, {
        traceId,
    }).pipe(mapTo(undefined));
}

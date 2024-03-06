import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    TUpdateDashboardDraftProps,
    updateDashboardDraftHandle,
} from '../../../handlers/dashboards/updateDashboardDraftHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';

export type TUpdateDashboardDraftArguments = TUpdateDashboardDraftProps & TWithTraceId;

export type TUpdateDashboardDraftReturnType = undefined;

export function updateDashboardDraft(
    ctx: TContextRef,
    props: TUpdateDashboardDraftArguments,
): Observable<TUpdateDashboardDraftReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    const { traceId, ...restProps } = props;

    return updateDashboardDraftHandle(update, restProps, {
        traceId,
    }).pipe(mapTo(undefined));
}

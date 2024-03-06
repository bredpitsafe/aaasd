import type { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { renameDashboardHandle } from '../../../handlers/dashboards/renameDashboardHandle';
import type { TWithTraceId } from '../../../handlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import {
    TStorageDashboardId,
    TStorageDashboardName,
} from '../../../types/domain/dashboardsStorage';
import { TSocketURL } from '../../../types/domain/sockets';

export type TRenameDashboardArguments = TWithTraceId & {
    url: TSocketURL;
    id: TStorageDashboardId;
    name: TStorageDashboardName;
};

export type TRenameDashboardReturnType = undefined;

export function renameDashboard(
    ctx: TContextRef,
    props: TRenameDashboardArguments,
): Observable<TRenameDashboardReturnType> {
    const { update } = ModuleCommunicationHandlersRemoted(ctx);

    return renameDashboardHandle(update, props.url, props.id, props.name, {
        traceId: props.traceId,
    }).pipe(mapTo(undefined));
}

import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY } from '../../defs/observables';
import { TContextRef } from '../../di';
import { subscribeToDashboardHandle } from '../../handlers/dashboards/subscribeToDashboardHandle';
import type { TStorageDashboard, TStorageDashboardId } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { dedobs } from '../../utils/observable/memo';
import { shareReplayWithImmediateReset } from '../../utils/Rx/share';
import { shallowHash } from '../../utils/shallowHash';
import type { TraceId } from '../../utils/traceId';
import { ModuleCommunicationHandlersRemoted } from '../communicationRemoteHandlers';

export type TSubscribeToDashboardArguments = {
    url: TSocketURL;
    traceId: TraceId;
    id: TStorageDashboardId;
};

export type TSubscribeToDashboardReturnType = TStorageDashboard;

export function createDashboardSubscriptionFactory(
    ctx: TContextRef,
): (props: TSubscribeToDashboardArguments) => Observable<TSubscribeToDashboardReturnType> {
    const { requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    return dedobs(
        (props: TSubscribeToDashboardArguments): Observable<TSubscribeToDashboardReturnType> => {
            return subscribeToDashboardHandle(requestStream, props.url, props.id, {
                traceId: props.traceId,
            }).pipe(
                map((envelope) => envelope.payload.dashboard),
                shareReplayWithImmediateReset(),
            );
        },
        {
            normalize: ([props]) => shallowHash(props.url, props.id),
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}

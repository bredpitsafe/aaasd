import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import { TContextRef } from '../../di';
import { subscribeToDashboardsListHandle } from '../../handlers/dashboards/subscribeToDashboardsListHandle';
import type { TStorageDashboardListItem } from '../../types/domain/dashboardsStorage';
import type { TSocketURL } from '../../types/domain/sockets';
import { dedobs } from '../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../utils/Rx/share';
import { shallowHash } from '../../utils/shallowHash';
import type { TraceId } from '../../utils/traceId';
import { ModuleCommunicationHandlersRemoted } from '../communicationRemoteHandlers';

export type TSubscribeToDashboardsListArguments = {
    url: TSocketURL;
    traceId: TraceId;
};

export type TSubscribeToDashboardsListReturnType = TStorageDashboardListItem[];

export function createDashboardsListSubscriptionFactory(
    ctx: TContextRef,
): (
    props: TSubscribeToDashboardsListArguments,
) => Observable<TSubscribeToDashboardsListReturnType> {
    const { requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    return dedobs(
        (
            props: TSubscribeToDashboardsListArguments,
        ): Observable<TSubscribeToDashboardsListReturnType> => {
            return subscribeToDashboardsListHandle(requestStream, props.url, {
                traceId: props.traceId,
            }).pipe(
                map((envelope) => envelope.payload.list),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([props]) => shallowHash(props.url),
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
}

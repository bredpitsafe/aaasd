import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchComponentStateRevisionsHistoryHandle } from '../../../handlers/fetchComponentStateRevisionsHistoryHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TComponentId } from '../../../types/domain/component';
import { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { TSocketURL } from '../../../types/domain/sockets';
import { ISO } from '../../../types/time';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';

export type TGetComponentStateRevisionProps = {
    url: TSocketURL;
    componentId: TComponentId;
    platformTime: ISO;
    traceId: TraceId;
};
export type TGetComponentStateRevisionReturnType = TComponentStateRevision | null;

export const getComponentStateRevision = dedobs(
    (
        ctx: TContextRef,
        props: TGetComponentStateRevisionProps,
    ): Observable<TGetComponentStateRevisionReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return fetchComponentStateRevisionsHistoryHandle(
            request,
            props.url,
            {
                platformTime: props.platformTime,
                componentId: props.componentId,
                limit: 1,
            },
            options,
        ).pipe(
            map((result) => result.payload.componentStates.at(0) ?? null),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, props]) => shallowHash(props.url, props.componentId, props.platformTime),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

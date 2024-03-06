import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchComponentStateHandle } from '../../../handlers/fetchComponentStateHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TComponentId } from '../../../types/domain/component';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';

export type TGetComponentStateProps = {
    url: TSocketURL;
    componentId: TComponentId;
    digest: string;
    traceId: TraceId;
};
export type TGetComponentStateReturnType = string;

export const getComponentState = dedobs(
    (
        ctx: TContextRef,
        props: TGetComponentStateProps,
    ): Observable<TGetComponentStateReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return fetchComponentStateHandle(
            request,
            props.url,
            props.componentId,
            props.digest,
            options,
        ).pipe(
            map((envelope) => envelope.payload.state),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url, props.componentId, props.digest),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

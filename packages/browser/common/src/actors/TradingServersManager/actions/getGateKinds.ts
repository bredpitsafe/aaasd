import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchGateKindsHandle } from '../../../handlers/fetchGateKindsHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { TraceId } from '../../../utils/traceId';

export type TGetGateKindsParams = {
    url: TSocketURL;
    traceId: TraceId;
};
export type TGetGateKindsResult = {
    execGates: string[];
    mdGates: string[];
};

export const getGateKinds = dedobs(
    (ctx: TContextRef, { url, traceId }: TGetGateKindsParams): Observable<TGetGateKindsResult> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        return fetchGateKindsHandle(request, url, {
            traceId,
        }).pipe(
            map((envelope) => envelope.payload),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, props]) => props.url,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

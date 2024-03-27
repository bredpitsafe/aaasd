import { isNull } from 'lodash-es';
import type { Observable } from 'rxjs';
import { merge, of, partition, scan } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { TSubscribed } from '../../../handlers/def';
import { fetchComponentStateRevisionsHistoryHandle } from '../../../handlers/fetchComponentStateRevisionsHistoryHandle';
import { subscribeToComponentStateRevisionsHandle } from '../../../handlers/subscribeToComponentStateRevisionsHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TComponentId } from '../../../types/domain/component';
import { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { tapError } from '../../../utils/Rx/tap';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';

export type TGetComponentStateRevisionsProps = {
    url: TSocketURL;
    componentId: TComponentId;
    limit?: number;
    btRunNo?: number;
    traceId: TraceId;
};
export type TGetComponentStateRevisionsReturnType = TComponentStateRevision[];

export const getComponentStateRevisions = dedobs(
    (
        ctx: TContextRef,
        props: TGetComponentStateRevisionsProps,
    ): Observable<TGetComponentStateRevisionsReturnType> => {
        const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        const subscription$ = subscribeToComponentStateRevisionsHandle(
            requestStream,
            props.url,
            {
                componentId: props.componentId,
                btRunNo: props.btRunNo,
            },
            options,
        ).pipe(
            map((m) => m.payload),
            share(),
        );

        const [subscribed$, componentStateRevisions$] = partition(
            subscription$,
            (m): m is TSubscribed => m.type === 'Subscribed',
        );

        const snapshot$ = subscribed$.pipe(
            switchMap((m) =>
                isNull(m.platformTime)
                    ? of({
                          payload: {
                              componentStates: [],
                          },
                      })
                    : fetchComponentStateRevisionsHistoryHandle(
                          request,
                          props.url,
                          {
                              platformTime: m.platformTime,
                              componentId: props.componentId,
                              limit: props.limit,
                              btRunNo: props.btRunNo,
                          },
                          options,
                      ),
            ),
        );

        const cache = new UnifierWithCompositeHash<TComponentStateRevision>('platformTime');

        return merge(
            componentStateRevisions$.pipe(map((envelop) => envelop.componentStates)),
            snapshot$.pipe(map((envelope) => envelope.payload.componentStates)),
        ).pipe(
            scan((acc, actorStates) => {
                acc.modify(actorStates);
                return acc;
            }, cache),
            tapError(() => void cache.clear()),
            map((unifier) =>
                UnifierWithCompositeHash.getCachedArray(unifier).sort((a, b) =>
                    a.platformTime > b.platformTime ? -1 : 1,
                ),
            ),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) =>
            shallowHash(c, props.url, props.componentId, props.limit, props.btRunNo),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

import type { Observable } from 'rxjs';
import { merge, scan } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchPortfolioPositionHandle } from '../../../handlers/portfolioTracker/fetchPortfolioPositionHandle';
import { subscribeToPortfolioPositionsHandle } from '../../../handlers/portfolioTracker/subscribeToPortfolioPositionsHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TPortfolioBookId, TPortfolioPosition } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';

export type TGetPortfolioPositionsProps = {
    url: TSocketURL;
    bookIds: TPortfolioBookId[];
    traceId: TraceId;
};
export type TGetPortfolioPositionsReturnType = TPortfolioPosition[];

export const getPortfolioPositionsDedobsed = dedobs(
    (
        ctx: TContextRef,
        props: TGetPortfolioPositionsProps,
    ): Observable<TGetPortfolioPositionsReturnType> => {
        const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return merge(
            subscribeToPortfolioPositionsHandle(
                requestStream,
                props.url,
                props.bookIds,
                options,
            ).pipe(map((envelope) => envelope.payload.updates)),
            fetchPortfolioPositionHandle(request, props.url, props.bookIds, options).pipe(
                map((envelope) => envelope.payload.positions),
            ),
        ).pipe(
            scan((acc, books) => {
                acc.modify(books);
                return acc;
            }, new UnifierWithCompositeHash<TPortfolioPosition>('id')),
            map((unifier) => unifier.toArray()),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url, ...props.bookIds),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

import type { Observable } from 'rxjs';
import { merge, scan } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchPortfolioRisksHandle } from '../../../handlers/portfolioTracker/fetchPortfolioRisksHandle';
import { subscribeToPortfolioRisksHandle } from '../../../handlers/portfolioTracker/subscribeToPortfolioRisksHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TPortfolioBookId, TPortfolioRisks } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';

export type TGetPortfolioRisksProps = {
    url: TSocketURL;
    bookIds: TPortfolioBookId[];
    traceId: TraceId;
};
export type TGetPortfolioRisksReturnType = TPortfolioRisks[];

export const getPortfolioRisksDedobsed = dedobs(
    (
        ctx: TContextRef,
        props: TGetPortfolioRisksProps,
    ): Observable<TGetPortfolioRisksReturnType> => {
        const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return merge(
            subscribeToPortfolioRisksHandle(requestStream, props.url, props.bookIds, options).pipe(
                map((envelope) => envelope.payload.updates),
            ),
            fetchPortfolioRisksHandle(request, props.url, props.bookIds, options).pipe(
                map((envelope) => envelope.payload.risks),
            ),
        ).pipe(
            scan((acc, items) => {
                acc.modify(items);
                return acc;
            }, new UnifierWithCompositeHash<TPortfolioRisks>('id')),
            map((unifier) => unifier.toArray()),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url, ...props.bookIds),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

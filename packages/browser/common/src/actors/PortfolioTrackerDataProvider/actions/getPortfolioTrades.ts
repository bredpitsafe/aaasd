import type { Observable } from 'rxjs';
import { merge, scan } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchPortfolioTradesHandle } from '../../../handlers/portfolioTracker/fetchPortfolioTradesHandle';
import { subscribeToPortfolioTradesHandle } from '../../../handlers/portfolioTracker/subscribeToPortfolioTradesHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TPortfolioBookId, TPortfolioTrade } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';

export type TGetPortfolioTradesProps = {
    url: TSocketURL;
    bookIds: TPortfolioBookId[];
    traceId: TraceId;
};
export type TGetPortfolioTradesReturnType = TPortfolioTrade[];

export const getPortfolioTradesDedobsed = dedobs(
    (
        ctx: TContextRef,
        props: TGetPortfolioTradesProps,
    ): Observable<TGetPortfolioTradesReturnType> => {
        const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return merge(
            subscribeToPortfolioTradesHandle(requestStream, props.url, props.bookIds, options).pipe(
                map((envelope) => envelope.payload.updates),
            ),
            fetchPortfolioTradesHandle(request, props.url, props.bookIds, options).pipe(
                map((envelope) => envelope.payload.trades),
            ),
        ).pipe(
            scan((acc, items) => {
                acc.modify(items);
                return acc;
            }, new UnifierWithCompositeHash<TPortfolioTrade>('tradeId')),
            map((unifier) => unifier.toArray()),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url, ...props.bookIds),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

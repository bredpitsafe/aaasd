import type { Observable } from 'rxjs';
import { merge, scan } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchPortfoliosWithBooksHandle } from '../../../handlers/portfolioTracker/fetchPortfoliosWithBooksHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TPortfolio, TPortfolioBook } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { compareDates } from '../../../utils/timeCompare';
import { TraceId } from '../../../utils/traceId';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';

export type TGetPortfoliosWithBooksProps = { url: TSocketURL; traceId: TraceId };
export type TGetPortfoliosWithBooksReturnType = {
    portfolios: TPortfolio[];
    books: TPortfolioBook[];
};

export const getPortfoliosWithBooksDedobsed = dedobs(
    (
        ctx: TContextRef,
        props: TGetPortfoliosWithBooksProps,
    ): Observable<TGetPortfoliosWithBooksReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        const options = {
            traceId: props.traceId,
        };

        return merge(
            // not implemented yet at server side
            // subscribeToPortfolioBooksHandle(requestStream, props.url, options).pipe(
            //     map((envelope) => envelope.payload.updates),
            // ),
            fetchPortfoliosWithBooksHandle(request, props.url, options).pipe(
                map((envelope) => envelope.payload),
            ),
        ).pipe(
            scan(
                (acc, { books, portfolios }) => {
                    acc.books.modify(books);
                    acc.portfolios.modify(portfolios);
                    return acc;
                },
                {
                    portfolios: new UnifierWithCompositeHash<TPortfolio>('portfolioId', {
                        upsertPredicate: (prev, next) =>
                            prev === undefined ||
                            compareDates(next.platformTime, prev.platformTime) >= 0
                                ? next
                                : prev,
                    }),
                    books: new UnifierWithCompositeHash<TPortfolioBook>('bookId', {
                        upsertPredicate: (prev, next) =>
                            prev === undefined ||
                            compareDates(next.platformTime, prev.platformTime) >= 0
                                ? next
                                : prev,
                    }),
                },
            ),
            map(({ books, portfolios }) => {
                return {
                    books: books.toArray(),
                    portfolios: portfolios.toArray(),
                };
            }),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

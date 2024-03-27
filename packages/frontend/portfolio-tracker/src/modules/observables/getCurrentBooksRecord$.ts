import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import {
    TPortfolioBook,
    TPortfolioBookId,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function getCurrentBooksRecord$(
    portfolioBooks$: Observable<undefined | TPortfolioBook[]>,
): Observable<undefined | Record<TPortfolioBookId, TPortfolioBook>> {
    return portfolioBooks$.pipe(
        map((books) => {
            if (books === undefined) return undefined;
            return books.reduce(
                (acc, book) => {
                    acc[book.bookId] = book;
                    return acc;
                },
                {} as Record<TPortfolioBookId, TPortfolioBook>,
            );
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}

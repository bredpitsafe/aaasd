import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TContextRef } from '@frontend/common/src/di';
import { TPortfolioBookId } from '@frontend/common/src/types/domain/portfolioTraсker';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { combineLatest, concat, EMPTY, Observable, of, switchMap } from 'rxjs';

import { getPortfolioTradesDedobsed$ } from '../actions/getPortfolioTradesDedobsed$';

export function getCurrentPortfolioTrades$(
    ctx: TContextRef,
    activeBookIds$: Observable<undefined | TPortfolioBookId[]>,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
    getPortfolioTrades$ = getPortfolioTradesDedobsed$,
) {
    return combineLatest({ bookIds: activeBookIds$, url: currentSocketUrl$ }).pipe(
        switchMap(({ url, bookIds }) => {
            return concat(
                of(undefined),
                url === undefined || bookIds === undefined || bookIds.length === 0
                    ? EMPTY
                    : getPortfolioTrades$(ctx, url, bookIds, generateTraceId()),
            );
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}

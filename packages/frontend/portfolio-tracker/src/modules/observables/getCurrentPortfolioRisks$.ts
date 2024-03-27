import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TContextRef } from '@frontend/common/src/di';
import {
    TPortfolioBookId,
    TPortfolioRisks,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { combineLatest, concat, EMPTY, Observable, of, switchMap } from 'rxjs';

import { getPortfolioRisksDedobsed$ } from '../actions/getPortfolioRisksDedobsed$';

export function getCurrentPortfolioRisks$(
    ctx: TContextRef,
    activeBookIds$: Observable<undefined | TPortfolioBookId[]>,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
    getPortfolioRisks$ = getPortfolioRisksDedobsed$,
): Observable<undefined | TPortfolioRisks[]> {
    return combineLatest({ bookIds: activeBookIds$, url: currentSocketUrl$ }).pipe(
        switchMap(({ bookIds, url }) => {
            return concat(
                of(undefined),
                url === undefined || bookIds === undefined || bookIds.length === 0
                    ? EMPTY
                    : getPortfolioRisks$(ctx, url, bookIds, generateTraceId()),
            );
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}

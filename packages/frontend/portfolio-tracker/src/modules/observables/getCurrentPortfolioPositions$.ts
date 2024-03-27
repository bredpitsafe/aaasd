import { TContextRef } from '@frontend/common/src/di';
import { TPortfolioBookId } from '@frontend/common/src/types/domain/portfolioTraсker';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { combineLatest, concat, EMPTY, Observable, of, switchMap } from 'rxjs';

import { getPortfolioPositionsDedobsed$ } from '../actions/getPortfolioPositionsDedobsed$';

export function getCurrentPortfolioPositions$(
    ctx: TContextRef,
    activeBookIds$: Observable<undefined | TPortfolioBookId[]>,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
    getPortfolioPositions$ = getPortfolioPositionsDedobsed$,
) {
    return combineLatest({ bookIds: activeBookIds$, url: currentSocketUrl$ }).pipe(
        switchMap(({ url, bookIds }) => {
            return concat(
                of(undefined),
                url === undefined || bookIds === undefined || bookIds.length === 0
                    ? EMPTY
                    : getPortfolioPositions$(ctx, url, bookIds, generateTraceId()),
            );
        }),
        shareReplayWithImmediateReset(),
    );
}

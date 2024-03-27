import { TContextRef } from '@frontend/common/src/di';
import { getPortfoliosWithBooksUnbound } from '@frontend/common/src/modules/actions/portfolioTracker/getPortfolioBooks';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { concat, EMPTY, Observable, of, switchMap } from 'rxjs';

export function getPortfolioBooks$(
    ctx: TContextRef,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
) {
    const actor = ModuleActor(ctx);
    const notifications = ModuleNotifications(ctx);

    return currentSocketUrl$.pipe(
        switchMap((url) =>
            concat(
                of(undefined),
                url === undefined
                    ? EMPTY
                    : getPortfoliosWithBooksUnbound(
                          {
                              actor,
                              notifications,
                          },
                          url,
                          generateTraceId(),
                      ),
            ),
        ),
    );
}

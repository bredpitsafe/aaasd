import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TContextRef } from '@frontend/common/src/di';
import { getPortfolioTradesUnbound } from '@frontend/common/src/modules/actions/portfolioTracker/getPortfolioTrades';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { TPortfolioBookId } from '@frontend/common/src/types/domain/portfolioTraсker';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';

export const getPortfolioTradesDedobsed$ = dedobs(
    (ctx: TContextRef, url: TSocketURL, bookIds: TPortfolioBookId[], traceId: TraceId) => {
        const actor = ModuleActor(ctx);
        const notifications = ModuleNotifications(ctx);

        return getPortfolioTradesUnbound(
            {
                actor,
                notifications,
            },
            url,
            bookIds,
            traceId,
        ).pipe(shareReplayWithDelayedReset(SHARE_RESET_DELAY));
    },
    {
        normalize: ([, url, bookIds]) => shallowHash(url, ...bookIds),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

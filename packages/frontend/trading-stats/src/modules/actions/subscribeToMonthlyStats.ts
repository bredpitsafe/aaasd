import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TMonthlyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { concat, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { subscribeTradingStatsMonthly } from './index';

export const subscribeToMonthlyStats = dedobs(
    (ctx: TContextRef, statsFilter: TMonthlyStatsFilter, timeZone: TimeZone) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return currentSocketUrl$.pipe(
            filter((url): url is TSocketURL => url !== undefined),
            switchMap((url) =>
                concat(
                    of(undefined),
                    subscribeTradingStatsMonthly(ctx, url, statsFilter, timeZone),
                ),
            ),
            shareReplayWithImmediateReset(),
        );
    },
    {
        removeDelay: DEDUPE_REMOVE_DELAY,
        normalize: ([ctx, filter, timeZone]) => shallowHash(ctx, JSON.stringify(filter), timeZone),
    },
);

import type { TimeZone } from '@common/types';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import { ModuleFactory } from '@frontend/common/src/di';
import { dedobs } from '@frontend/common/src/utils/observable/memo.ts';
import { isEqual, isNil } from 'lodash-es';
import { distinctUntilChanged, filter, map } from 'rxjs';

import { getDailyStatsFilter } from '../../utils/getDailyStatsFilter.ts';
import { getMonthlyStatsFilter } from '../../utils/getMonthlyStatsFilter.ts';
import { getTradingStatsDailyFilter, getTradingStatsMonthlyFilter } from '../../utils/router.ts';
import { ETradingStatsRouteParams, ETradingStatsRoutes } from '../router/defs.ts';
import { ModuleTradingStatsRouter } from '../router/module.ts';

export const ModuleSubscribeToTradingStatsFilter = ModuleFactory((ctx) => {
    const { state$ } = ModuleTradingStatsRouter(ctx);

    return dedobs(
        (timeZone: TimeZone) => {
            return state$.pipe(
                map((state) => {
                    if (state.route.name === ETradingStatsRoutes.Daily) {
                        const filter = getTradingStatsDailyFilter(timeZone, state.route.params);
                        return {
                            route: ETradingStatsRoutes.Daily,
                            requestFilter: getDailyStatsFilter(filter),
                            componentFilter: {
                                ...filter,
                                date: filter[ETradingStatsRouteParams.Date],
                            },
                        } as const;
                    }
                    if (state.route.name === ETradingStatsRoutes.Monthly) {
                        const filter = getTradingStatsMonthlyFilter(timeZone, state.route.params);
                        return {
                            route: ETradingStatsRoutes.Monthly,
                            requestFilter: getMonthlyStatsFilter(filter),
                            componentFilter: {
                                ...filter,
                                date: filter[ETradingStatsRouteParams.From],
                            },
                        } as const;
                    }
                }),
                filter((params): params is Exclude<typeof params, undefined> => !isNil(params)),
                distinctUntilChanged((a, b) => isEqual(a, b)),
            );
        },
        {
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

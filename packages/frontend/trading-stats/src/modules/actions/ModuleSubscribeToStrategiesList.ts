import type { TimeZone } from '@common/types';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TStrategyOption } from '@frontend/common/src/types/domain/ownTrades.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { switchMap } from 'rxjs';

import { getStrategies } from '../../utils/dailyPnl.ts';
import { ETradingStatsRoutes } from '../router/defs.ts';
import { ModuleSubscribeToDailyStatsSnapshot } from './ModuleSubscribeToDailyStatsSnapshot.ts';
import { ModuleSubscribeToDailyStatsWithExcludedStrategies } from './ModuleSubscribeToDailyStatsWithExcludedStrategies.ts';
import { ModuleSubscribeToMonthlyStats } from './ModuleSubscribeToMonthlyStats.ts';
import { ModuleSubscribeToMonthlyStatsWithExcludedStrategies } from './ModuleSubscribeToMonthlyStatsWithExcludedStrategies.ts';
import { ModuleSubscribeToTradingStatsFilter } from './ModuleSubscribeToTradingStatsFilter.ts';

export const ModuleSubscribeToStrategiesList = createObservableProcedure(
    (ctx) => {
        const subscribeToDailyStatsWithExcludedStrategies =
            ModuleSubscribeToDailyStatsWithExcludedStrategies(ctx);
        const subscribeToDailyStats = ModuleSubscribeToDailyStatsSnapshot(ctx);
        const subscribeToMonthlyStatsWithExcludedStrategies =
            ModuleSubscribeToMonthlyStatsWithExcludedStrategies(ctx);
        const subscribeToTradingStatsMonthly = ModuleSubscribeToMonthlyStats(ctx);
        const subscribeToTradingStatsFilter = ModuleSubscribeToTradingStatsFilter(ctx);

        return (
            params: TWithSocketTarget & {
                timeZone: TimeZone;
                showExcludedStrategies: boolean;
            },
            options,
        ): Observable<TValueDescriptor2<TStrategyOption[]>> => {
            const { showExcludedStrategies, timeZone, target } = params;
            const filter$ = subscribeToTradingStatsFilter(timeZone);

            return filter$.pipe(
                switchMap((filters) => {
                    return showExcludedStrategies
                        ? filters.route === ETradingStatsRoutes.Daily
                            ? subscribeToDailyStats(
                                  {
                                      target,
                                      timeZone,
                                      filters: filters.requestFilter,
                                  },
                                  options,
                              )
                            : subscribeToTradingStatsMonthly(
                                  {
                                      target,
                                      timeZone,
                                      filters: filters.requestFilter,
                                  },
                                  options,
                              )
                        : filters.route === ETradingStatsRoutes.Daily
                          ? subscribeToDailyStatsWithExcludedStrategies(
                                {
                                    target,
                                    timeZone,
                                    filters: filters.requestFilter,
                                },
                                options,
                            )
                          : subscribeToMonthlyStatsWithExcludedStrategies(
                                {
                                    target,
                                    timeZone,
                                    filters: filters.requestFilter,
                                },
                                options,
                            );
                }),
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor(getStrategies(value.balanceStats)),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, {
                    target: semanticHash.withHasher(getSocketUrlHash),
                }),
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: SHARE_RESET_DELAY,
        },
    },
);

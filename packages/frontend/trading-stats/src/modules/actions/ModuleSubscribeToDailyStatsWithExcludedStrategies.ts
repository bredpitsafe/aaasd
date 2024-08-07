import type { TimeZone } from '@common/types';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats.ts';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { switchMap } from 'rxjs';

import { filterExcludedStrategiesFromData } from '../../utils/excludedStrategies.ts';
import { ModuleExcludedStrategies } from './ModuleExcludedStrategies.ts';
import { ModuleSubscribeToDailyStatsSnapshot } from './ModuleSubscribeToDailyStatsSnapshot.ts';
import { dailyStatsFilterSemanticHashDescriptor } from './utils.ts';

export const ModuleSubscribeToDailyStatsWithExcludedStrategies = createObservableProcedure(
    (ctx) => {
        const subscribeToDailyStats = ModuleSubscribeToDailyStatsSnapshot(ctx);
        const { subscribeToExcludedStrategies } = ModuleExcludedStrategies(ctx);

        return (
            params: TWithSocketTarget & { filters: TDailyStatsFilter; timeZone: TimeZone },
            options,
        ) => {
            return subscribeToExcludedStrategies(params.target).pipe(
                switchMap((excludedStrategies) => {
                    return subscribeToDailyStats(params, options).pipe(
                        mapValueDescriptor(({ value }) => {
                            return createSyncedValueDescriptor({
                                balanceStats: filterExcludedStrategiesFromData(
                                    value.balanceStats,
                                    excludedStrategies,
                                ),
                                exchangeStats: filterExcludedStrategiesFromData(
                                    value.exchangeStats,
                                    excludedStrategies,
                                ),
                                baseAssetStats: filterExcludedStrategiesFromData(
                                    value.baseAssetStats,
                                    excludedStrategies,
                                ),
                            });
                        }),
                    );
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, {
                    target: semanticHash.withHasher(getSocketUrlHash),
                    filters: {
                        ...semanticHash.withNullable(isDeepObjectEmpty),
                        ...semanticHash.withHasher<TDailyStatsFilter>((filters) =>
                            semanticHash.get(filters, dailyStatsFilterSemanticHashDescriptor),
                        ),
                    },
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);

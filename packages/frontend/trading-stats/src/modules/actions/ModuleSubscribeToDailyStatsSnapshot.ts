import { isSubscriptionEventSubscribed } from '@common/rx';
import type { TimeZone } from '@common/types';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import type {
    TBalanceStatDaily,
    TBaseAssetStat,
    TDailyStatsFilter,
    TExchangeStat,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleSubscribeToDailyStatsUpdates } from './ModuleSubscribeToDailyStatsUpdates.ts';
import { dailyStatsFilterSemanticHashDescriptor } from './utils.ts';

type TAccumulatorPayload = {
    balanceStats: UnifierWithCompositeHash<TBalanceStatDaily>;
    baseAssetStats: UnifierWithCompositeHash<TBaseAssetStat>;
    exchangeStats: UnifierWithCompositeHash<TExchangeStat>;
};

export const ModuleSubscribeToDailyStatsSnapshot = createObservableProcedure(
    (ctx) => {
        const subscribeToUpdates = ModuleSubscribeToDailyStatsUpdates(ctx);

        return (
            params: TWithSocketTarget & { filters: TDailyStatsFilter; timeZone: TimeZone },
            options,
        ) => {
            return subscribeToUpdates(params, options).pipe(
                scanValueDescriptor(
                    (acc: undefined | TValueDescriptor2<TAccumulatorPayload>, vd) => {
                        const cache = acc?.value ?? {
                            balanceStats: new UnifierWithCompositeHash<TBalanceStatDaily>([
                                'strategy',
                                'assetOrInstrumentId',
                            ]),
                            baseAssetStats: new UnifierWithCompositeHash<TBaseAssetStat>([
                                'strategy',
                                'assetId',
                            ]),
                            exchangeStats: new UnifierWithCompositeHash<TExchangeStat>([
                                'strategy',
                                'exchangeName',
                            ]),
                        };

                        if (isSubscriptionEventSubscribed(vd.value)) {
                            cache.balanceStats.clear();
                            cache.exchangeStats.clear();
                            cache.baseAssetStats.clear();
                        } else {
                            cache.balanceStats.modify(vd.value.payload.balanceStats);
                            cache.exchangeStats.modify(vd.value.payload.exchangeStats);
                            cache.baseAssetStats.modify(vd.value.payload.baseAssetStats);
                        }

                        return createSyncedValueDescriptor(cache);
                    },
                ),
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor({
                        balanceStats: value.balanceStats.toArray(),
                        exchangeStats: value.exchangeStats.toArray(),
                        baseAssetStats: value.baseAssetStats.toArray(),
                    }),
                ),
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

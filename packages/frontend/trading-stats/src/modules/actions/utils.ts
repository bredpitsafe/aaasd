import type {
    TDailyStatsFilter,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import type { THashDescriptor } from '@frontend/common/src/utils/semanticHash.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';

export const dailyStatsFilterSemanticHashDescriptor: THashDescriptor<TDailyStatsFilter> = {
    include: {
        baseAssets: semanticHash.withSorter(null),
        volumeAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
    },
    exclude: {
        baseAssets: semanticHash.withSorter(null),
        volumeAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
    },
};

export const monthlyStatsFilterSemanticHashDescriptor: THashDescriptor<TMonthlyStatsFilter> = {
    include: {
        baseAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
        volumeAssets: semanticHash.withSorter(null),
    },
    exclude: {
        baseAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
        volumeAssets: semanticHash.withSorter(null),
    },
};

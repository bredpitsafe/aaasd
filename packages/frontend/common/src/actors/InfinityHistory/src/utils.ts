import type { TProductLogFilters } from '../../../modules/actions/productLogs/defs.ts';
import type { THashDescriptor } from '../../../utils/semanticHash.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import type { TFetchOwnTradesFilters } from './ModuleFetchOwnTrades.ts';

export const fetchOwnTradesFiltersHashDescriptor: THashDescriptor<TFetchOwnTradesFilters> = {
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

export const productLogsFiltersHashDescriptor: THashDescriptor<TProductLogFilters> = {
    include: {
        level: semanticHash.withSorter(null),
        message: semanticHash.withSorter(null),
        actorKey: semanticHash.withSorter(null),
        actorGroup: semanticHash.withSorter(null),
    },
    exclude: {
        message: semanticHash.withSorter(null),
        actorKey: semanticHash.withSorter(null),
        actorGroup: semanticHash.withSorter(null),
    },
};

import { semanticHash, THashDescriptor } from '../../utils/semanticHash';
import { TFetchOwnTradesFilters } from './fetchOwnTradesHandle';

export const fetchOwnTradesFiltersHashDescriptor: THashDescriptor<TFetchOwnTradesFilters> = {
    include: {
        baseAssets: semanticHash.withSorter(null),
        quoteAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
    },
    exclude: {
        baseAssets: semanticHash.withSorter(null),
        quoteAssets: semanticHash.withSorter(null),
        anyAssets: semanticHash.withSorter(null),
        instruments: semanticHash.withSorter(null),
        exchanges: semanticHash.withSorter(null),
        strategies: semanticHash.withSorter(null),
    },
};

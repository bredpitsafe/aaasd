import { semanticHash, THashDescriptor } from '../../utils/semanticHash';
import { TProductLogFilters } from './defs';

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

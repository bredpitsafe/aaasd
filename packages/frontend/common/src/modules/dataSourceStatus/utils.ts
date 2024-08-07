import type { TDataSourceName, TDataSourceState } from './defs';

export const getSourcesBySocketUrl =
    (urls: string[]) => (map: Record<TDataSourceName, TDataSourceState>) => {
        return Object.entries(map)
            .filter(([, dataSource]) => urls.indexOf(dataSource.url) > -1)
            .map(([, dataSource]) => dataSource);
    };

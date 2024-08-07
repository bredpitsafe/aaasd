import { omit } from 'lodash-es';
import memoize from 'memoizee';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';

import { createObservableBox } from '../../utils/rx';
import type {
    EDataSourceType,
    TDataSourceLog,
    TDataSourceName,
    TDataSourceState,
    TDataSourceStateMap,
} from './defs';
import { getSourcesBySocketUrl } from './utils';

export const dataSourcesBox = createObservableBox<TDataSourceStateMap>({});

export const dataSourceList$ = dataSourcesBox.obs.pipe(
    map((v) => Object.values(v)),
    shareReplay(1),
);

export function addDataSource(
    type: EDataSourceType,
    name: TDataSourceName,
    url: string,
    log: TDataSourceLog,
): void {
    const map = dataSourcesBox.get();

    dataSourcesBox.set({
        ...map,
        [name]: {
            type,
            name,
            url,
            level: log.level,
            status: log.status,
            log: [log],
        },
    });
}

export function upsertDataSources(map: TDataSourceStateMap): void {
    dataSourcesBox.set((v) => Object.assign(v, map));
}

export function deleteDataSource(name: TDataSourceName): void {
    dataSourcesBox.set(omit(dataSourcesBox.get(), name));
}

export function changeDataSourceStatus(name: TDataSourceName, log: TDataSourceLog): void {
    const map = dataSourcesBox.get();
    const network = map[name];

    network &&
        dataSourcesBox.set({
            ...map,
            [name]: {
                ...network,
                status: log.status,
                level: log.level,
                log: network.log.concat(log).slice(-10),
            },
        });
}

export const getDataSource$ = memoize(
    (name: TDataSourceName): Observable<TDataSourceState> =>
        dataSourcesBox.obs.pipe(
            map((record) => record[name]),
            filter((v) => v !== undefined),
            distinctUntilChanged(),
        ),
    { primitive: true, max: 100 },
);

export const getDataSources$ = (urls: string[]): Observable<TDataSourceState[]> => {
    return dataSourcesBox.obs.pipe(map(getSourcesBySocketUrl(urls)));
};

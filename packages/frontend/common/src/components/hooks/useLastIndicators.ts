import type { ISO } from '@common/types';
import { generateTraceId, mapGet } from '@common/utils';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { bufferTime, EMPTY, merge, scan } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { useModule } from '../../di/react';
import type {
    TIndicator,
    TIndicatorKey,
    TIndicatorsQuery,
} from '../../modules/actions/indicators/defs';
import { ModuleSubscribeToIndicatorsFiniteSnapshot } from '../../modules/actions/indicators/snapshot';
import type { TSocketURL } from '../../types/domain/sockets';
import { EMPTY_ARRAY } from '../../utils/const';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { extractSyncedValueFromValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';

export function useLastIndicatorsMap(
    queries: TIndicatorsQuery[],
): ReadonlyMap<TIndicatorKey, TIndicator> | undefined {
    const subscribe = useModule(ModuleSubscribeToIndicatorsFiniteSnapshot);
    const groupedQueries = useMemo(() => getGroupedIndicatorsQueries(queries), [queries]);

    return useSyncObservable(
        useMemo(() => {
            const traceId = generateTraceId();
            return isEmpty(groupedQueries)
                ? EMPTY
                : merge(...groupedQueries.map((query) => subscribe(query, { traceId }))).pipe(
                      extractSyncedValueFromValueDescriptor(),
                      bufferTime(1000, 1000),
                      filter(({ length }) => length > 0),
                      map((bufferedIndicators) =>
                          bufferedIndicators.filter(({ length }) => length > 0),
                      ),
                      filter(({ length }, index) => index === 0 || length > 0),
                      scan((hash, nestedIndicators) => {
                          for (const indicators of nestedIndicators) {
                              hash.modify(indicators);
                          }
                          return hash;
                      }, new UnifierWithCompositeHash<TIndicator>('key')),
                      map(
                          (hash) =>
                              new Map<TIndicatorKey, TIndicator>(
                                  hash.getMap() as Iterable<readonly [TIndicatorKey, TIndicator]>,
                              ),
                      ),
                  );
        }, [groupedQueries, subscribe]),
    );
}

export function useIndicatorsUpdates(queries: TIndicatorsQuery[]): TIndicator[] {
    const subscribe = useModule(ModuleSubscribeToIndicatorsFiniteSnapshot);
    const groupedQueries = useMemo(() => getGroupedIndicatorsQueries(queries), [queries]);

    const indicatorsWithQuery$ = useMemo(() => {
        const traceId = generateTraceId();
        return merge(...groupedQueries.map((query) => subscribe(query, { traceId }))).pipe(
            extractSyncedValueFromValueDescriptor(),
            bufferTime(1000, 1000),
            filter(({ length }) => length > 0),
            map((indicators) => indicators?.flat(1) ?? (EMPTY_ARRAY as TIndicator[])),
        );
    }, [groupedQueries, subscribe]);

    return useSyncObservable(indicatorsWithQuery$, EMPTY_ARRAY as TIndicator[]);
}

export function getGroupedIndicatorsQueries(queries: TIndicatorsQuery[]): TIndicatorsQuery[] {
    const map = new Map<string, TIndicatorsQueryTemplate>();

    for (const query of queries) {
        const key = getIndicatorQueryKey(query);
        const value = mapGet(map, key, () =>
            getQueryTemplate(query.url, query.btRuns, query.minUpdateTime),
        );

        query.names && value.names.push(...query.names);
        query.nameRegexes && value.nameRegexes.push(...query.nameRegexes);
    }

    return Array.from(map, ([, q]) => {
        return getQueryFromTemplate(q);
    });
}

function getIndicatorQueryKey(query: TIndicatorsQuery): string {
    return `${query.url}+${query.btRuns}`;
}

type TIndicatorsQueryTemplate = TIndicatorsQuery &
    Required<Pick<TIndicatorsQuery, 'names' | 'nameRegexes'>>;

function getQueryFromTemplate(template: TIndicatorsQueryTemplate): TIndicatorsQuery {
    const query = { ...template } as TIndicatorsQuery;

    if (query.names?.length === 0) {
        query.names = undefined;
    }
    if (query.nameRegexes?.length === 0) {
        query.nameRegexes = undefined;
    }

    return query;
}

function getQueryTemplate(
    url: TSocketURL,
    btRuns?: TIndicatorsQuery['btRuns'],
    minUpdateTime?: ISO,
): TIndicatorsQueryTemplate {
    return {
        url,
        btRuns,
        minUpdateTime,
        names: [],
        nameRegexes: [],
    };
}

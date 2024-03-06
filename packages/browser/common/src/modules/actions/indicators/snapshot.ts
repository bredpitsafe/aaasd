import { isEmpty, isNil } from 'lodash-es';
import { merge, Observable } from 'rxjs';

import {
    requestIndicatorsItemsProcedureDescriptor,
    subscribeToIndicatorsUpdatesProcedureDescriptor,
} from '../../../actors/InfinityHistory/envelope';
import { lowerCaseComparator } from '../../../components/AgTable/comparators/lowerCaseComparator';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { ModuleFactory } from '../../../di';
import { TWithTraceId } from '../../../handlers/def';
import { createSubscriptionWithSnapshot2 } from '../../../utils/createSubscriptionWithSnapshot2';
import { dedobs } from '../../../utils/observable/memo';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { mapValueDescriptor, scanValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import { convertErrToGrpcFail } from '../../../utils/ValueDescriptor/Fails';
import { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import {
    INDICATORS_FETCH_LIMIT,
    MAX_INDICATOR_NAMES_IN_A_SINGLE_QUERY,
    TIndicator,
    TIndicatorsQuery,
} from './defs';

export const ModuleFetchIndicatorsSnapshot = createRemoteProcedureCall(
    requestIndicatorsItemsProcedureDescriptor,
)();

export const ModuleSubscribeToIndicatorsUpdates = createRemoteProcedureCall(
    subscribeToIndicatorsUpdatesProcedureDescriptor,
)();

const startSubscription = createSubscriptionWithSnapshot2<TIndicator>({
    handleFetchError: (err) => ({
        fail: convertErrToGrpcFail(err),
        retryDelay: 2000,
    }),
    handleSubscriptionError: (err) => ({
        fail: convertErrToGrpcFail(err),
        retryDelay: 2000,
    }),
});

export const ModuleSubscribeToIndicatorsSnapshot = ModuleFactory((ctx) => {
    const fetch = ModuleFetchIndicatorsSnapshot(ctx);
    const subscribe = ModuleSubscribeToIndicatorsUpdates(ctx);

    return dedobs(
        (
            query: TIndicatorsQuery,
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TIndicator[]>> => {
            const queries = splitQueryToChunks(query, MAX_INDICATOR_NAMES_IN_A_SINGLE_QUERY);

            return merge(
                ...queries.map((query, index) => {
                    const cache = new UnifierWithCompositeHash<TIndicator>(['key']);
                    const { url, ...filters } = query;

                    return startSubscription({
                        cache,
                        subscribe: () => subscribe({ url, filters, sort: {} }, options),
                        fetch: () =>
                            fetch(
                                {
                                    url,
                                    filters: {
                                        ...filters,
                                        // Temporarily disable platformTime since backend doesn't handle it correctly
                                        // and may return empty snapshot when provided.
                                        // @see https://krwteam.slack.com/archives/G01KDRJBXG8/p1700148652706279?thread_ts=1691760189.525339&cid=G01KDRJBXG8
                                        //platformTime: event.payload.platformTime ?? undefined,
                                    },
                                    params: {
                                        limit: getLimit(query),
                                        offset: 0,
                                    },
                                    sort: undefined,
                                },
                                options,
                            ),
                    }).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor({
                                index,
                                indicators: value,
                            }),
                        ),
                    );
                }),
            ).pipe(
                scanValueDescriptor(
                    (acc: undefined | TValueDescriptor2<Map<number, TIndicator[]>>, { value }) => {
                        const cache = acc?.value ?? new Map<number, TIndicator[]>();
                        cache.set(value.index, value.indicators);
                        return createSyncedValueDescriptor(cache);
                    },
                ),
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(Array.from(value.values()).flat());
                }),
            );
        },
        {
            normalize: ([query]) =>
                semanticHash.get(query, {
                    btRuns: semanticHash.withSorter(lowerCaseComparator),
                    names: semanticHash.withSorter(lowerCaseComparator),
                    nameRegexes: semanticHash.withSorter(lowerCaseComparator),
                }),

            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

function splitQueryToChunks(query: TIndicatorsQuery, chunkSize: number): TIndicatorsQuery[] {
    const maxLength = query.names?.length || query.nameRegexes?.length;
    if (isNil(maxLength)) {
        return [query];
    }
    const queries: TIndicatorsQuery[] = [];

    for (let i = 0; i < maxLength; i += chunkSize) {
        const names = query.names?.slice(i, chunkSize + i);
        const nameRegexes = query.nameRegexes?.slice(i, chunkSize + i);

        queries.push({
            ...query,
            names: isEmpty(names) ? undefined : names,
            nameRegexes: isEmpty(nameRegexes) ? undefined : nameRegexes,
        });
    }

    return queries;
}

function getLimit(query: TIndicatorsQuery): number {
    return query.names && query.names.length > INDICATORS_FETCH_LIMIT
        ? query.names.length
        : INDICATORS_FETCH_LIMIT;
}

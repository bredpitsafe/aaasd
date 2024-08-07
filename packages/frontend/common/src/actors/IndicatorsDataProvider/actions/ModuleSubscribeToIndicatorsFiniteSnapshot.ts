import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator.ts';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { ModuleFactory } from '../../../di';
import type { TWithTraceId } from '../../../modules/actions/def.ts';
import type { TIndicator, TIndicatorsQuery } from '../../../modules/actions/indicators/defs.ts';
import { MAX_INDICATOR_NAMES_IN_A_SINGLE_QUERY } from '../../../modules/actions/indicators/defs.ts';
import { convertToSubscriptionEventValueDescriptor } from '../../../modules/actions/utils.ts';
import { createSubscriptionWithSnapshot2 } from '../../../utils/createSubscriptionWithSnapshot2.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { dedobs } from '../../../utils/observable/memo.ts';
import { mapValueDescriptor, squashValueDescriptors } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash.ts';
import { convertErrToGrpcFail } from '../../../utils/ValueDescriptor/Fails.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleFetchIndicatorsSnapshot } from './ModuleFetchIndicatorsSnapshot.ts';
import { ModuleToSubscribeToIndicators } from './ModuleToSubscribeToIndicators.ts';
import { getLimit, splitQueryToChunks } from './utils.ts';

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

export const ModuleSubscribeToIndicatorsFiniteSnapshot = ModuleFactory((ctx) => {
    const fetch = ModuleFetchIndicatorsSnapshot(ctx);
    const subscribe = ModuleToSubscribeToIndicators(ctx);

    return dedobs(
        (
            query: TIndicatorsQuery,
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TIndicator[]>> => {
            const queries = splitQueryToChunks(query, MAX_INDICATOR_NAMES_IN_A_SINGLE_QUERY);

            return combineLatest(
                queries.map((query) => {
                    const cache = new UnifierWithCompositeHash<TIndicator>(['key']);
                    const { url, ...filters } = query;

                    return startSubscription({
                        cache,
                        subscribe: () =>
                            subscribe({ target: url, filters, updatesOnly: true }, options).pipe(
                                convertToSubscriptionEventValueDescriptor(
                                    (envelope) => envelope.indicators,
                                ),
                            ),
                        fetch: () =>
                            fetch(
                                {
                                    target: url,
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
                            ).pipe(
                                mapValueDescriptor(({ value }) =>
                                    createSyncedValueDescriptor(value.payload.entities),
                                ),
                            ),
                    });
                }),
            ).pipe(
                squashValueDescriptors(),
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(value.flat());
                }),
            );
        },
        {
            normalize: ([query]) =>
                semanticHash.get(query, {
                    url: semanticHash.withHasher(getSocketUrlHash),
                    btRuns: semanticHash.withSorter(lowerCaseComparator),
                    names: semanticHash.withSorter(lowerCaseComparator),
                    nameRegexes: semanticHash.withSorter(lowerCaseComparator),
                }),

            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

import type { Minutes } from '@common/types';
import type { TraceId } from '@common/utils';
import { minutes2milliseconds } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { isEmpty, isNil } from 'lodash-es';

import type { TContextRef } from '../../../di';
import { EFetchSortOrder } from '../../../modules/actions/def.ts';
import type { TIndicator } from '../../../modules/actions/indicators/defs';
import { convertToSubscriptionEventValueDescriptor } from '../../../modules/actions/utils.ts';
import type { TSocketURL } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { EMPTY_OBJECT } from '../../../utils/const';
import { debounceBy } from '../../../utils/debounceBy';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type {
    TFetchIndicatorsSnapshotFilters,
    TFetchIndicatorsSnapshotSort,
} from '../actions/ModuleFetchIndicatorsSnapshot.ts';
import { ModuleFetchIndicatorsSnapshot } from '../actions/ModuleFetchIndicatorsSnapshot.ts';
import { ModuleToSubscribeToIndicators } from '../actions/ModuleToSubscribeToIndicators.ts';

type TProps = {
    ctx: TContextRef;
    url: TSocketURL;
    sort?: TFetchIndicatorsSnapshotSort;
    filters?: TFetchIndicatorsSnapshotFilters;
};

export const indicatorsInfinitySnapshotBank = createBank({
    logger: logger.child(new Binding('IndicatorsBank')),
    createKey: ({ ctx, sort, filters, url }: TProps) =>
        semanticHash.get(
            {
                url,
                ctx,
                sort: isEmpty(sort) ? undefined : sort,
                filters: isEmpty(filters) ? undefined : filters,
            },
            {
                url: semanticHash.withHasher(getSocketUrlHash),
                request: semanticHash.withHasher(shallowHash),
                requestStream: semanticHash.withHasher(shallowHash),
                sort: {
                    fieldsOrder: semanticHash.withSorter(null),
                },
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TFetchIndicatorsSnapshotFilters | undefined>(
                        (filters) =>
                            semanticHash.get(filters, {
                                btRuns: semanticHash.withSorter(null),
                                names: semanticHash.withSorter(null),
                                nameRegexes: semanticHash.withSorter(null),
                            }),
                    ),
                },
            },
        ),
    createValue: (key, { ctx, url, sort, filters }: TProps) => {
        const fetch = ModuleFetchIndicatorsSnapshot(ctx);
        const subscribe = ModuleToSubscribeToIndicators(ctx);

        function fetchWrapper(traceId: TraceId, offset: number, limit: number) {
            return fetch(
                {
                    target: url,
                    params: { limit, offset },
                    sort,
                    filters,
                },
                { traceId },
            ).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(value.payload.entities);
                }),
            );
        }

        // platformTime its filter for historical requests
        const subscribeWrapper =
            filters?.platformTime === undefined
                ? (traceId: TraceId) => {
                      return subscribe(
                          { target: url, filters, updatesOnly: true },
                          {
                              traceId,
                              enableRetries: false,
                          },
                      ).pipe(
                          convertToSubscriptionEventValueDescriptor(
                              (payload) => payload.indicators,
                          ),
                      );
                  }
                : undefined;

        return new InfinitySnapshot<TIndicator>({
            fetch: fetchWrapper,
            subscribe: subscribeWrapper,
            getKey: (item) => item.key,
            sortPredicate: getSortBacktestingTasksPredicate(sort ?? EMPTY_OBJECT),
        });
    },

    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: minutes2milliseconds(2 as Minutes) }),
    ),

    onRemove: (key, value) => value.destroy(),
});

function getSortBacktestingTasksPredicate(sort: TFetchIndicatorsSnapshotSort) {
    return function sortPredicate(a: TIndicator, b: TIndicator): number {
        if (sort.fieldsOrder) {
            for (const [field, order] of sort.fieldsOrder) {
                const aField = a[field];
                const bField = b[field];

                if (isNil(aField) && isNil(bField)) {
                    continue;
                }

                if (isNil(aField)) {
                    return 1;
                }
                if (isNil(bField)) {
                    return -1;
                }
                if (aField > bField) {
                    return order === EFetchSortOrder.Asc ? 1 : -1;
                }
                if (aField < bField) {
                    return order === EFetchSortOrder.Asc ? -1 : 1;
                }
            }
        }

        return 0;
    };
}

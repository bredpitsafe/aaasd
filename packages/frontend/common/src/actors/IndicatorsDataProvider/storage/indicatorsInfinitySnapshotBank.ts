import { isEmpty, isNil } from 'lodash-es';

import { TContextRef } from '../../../di';
import { EFetchSortOrder } from '../../../handlers/def';
import { convertToSubscriptionEventValueDescriptor } from '../../../handlers/utils';
import type { TIndicator } from '../../../modules/actions/indicators/defs';
import type { TSocketURL } from '../../../types/domain/sockets';
import { Minutes } from '../../../types/time.ts';
import { createBank } from '../../../utils/Bank';
import { EMPTY_OBJECT } from '../../../utils/const';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { minutes2milliseconds } from '../../../utils/time.ts';
import type { TraceId } from '../../../utils/traceId';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import {
    ModuleFetchIndicatorsSnapshot,
    TFetchIndicatorsSnapshotFilters,
    TFetchIndicatorsSnapshotSort,
} from '../actions/ModuleFetchIndicatorsSnapshot.ts';
import { ModuleToSubscribeToIndicators } from '../actions/ModuleToSubscribeToIndicators.ts';

type TProps = {
    ctx: TContextRef;
    url: TSocketURL;
    sort?: TFetchIndicatorsSnapshotSort;
    filters?: TFetchIndicatorsSnapshotFilters;
};

export const indicatorsInfinitySnapshotBank = createBank({
    createKey: ({ ctx, sort, filters, url }: TProps) => {
        return semanticHash.get(
            {
                url,
                ctx,
                sort: isEmpty(sort) ? undefined : sort,
                filters: isEmpty(filters) ? undefined : filters,
            },
            {
                request: semanticHash.withHasher(shallowHash),
                requestStream: semanticHash.withHasher(shallowHash),
                sort: {
                    fieldsOrder: semanticHash.withSorter(null),
                },
                filters: {
                    btRuns: semanticHash.withSorter(null),
                    names: semanticHash.withSorter(null),
                    nameRegexes: semanticHash.withSorter(null),
                },
            },
        );
    },
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

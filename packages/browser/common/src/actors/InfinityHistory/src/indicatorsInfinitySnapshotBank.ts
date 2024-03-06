import { isEmpty, isNil } from 'lodash-es';
import { map } from 'rxjs/operators';

import { EFetchSortOrder, NO_RETRIES, UPDATES_ONLY } from '../../../handlers/def';
import {
    fetchIndicatorsSnapshotHandle,
    TFetchIndicatorsSnapshotFilters,
    TFetchIndicatorsSnapshotSort,
} from '../../../handlers/Indicators/fetchIndicatorsSnapshotHandle';
import { subscribeToIndicatorsHandle } from '../../../handlers/Indicators/subscribeToIndicatorsHandle';
import { convertToSubscriptionEvent } from '../../../handlers/utils';
import type { TIndicator } from '../../../modules/actions/indicators/defs';
import type { IModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TSocketURL } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { EMPTY_OBJECT } from '../../../utils/const';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import type { TraceId } from '../../../utils/traceId';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';

type TProps = {
    request: IModuleCommunicationHandlersRemoted['request'];
    requestStream: IModuleCommunicationHandlersRemoted['requestStream'];
    url: TSocketURL;
    sort?: TFetchIndicatorsSnapshotSort;
    filters?: TFetchIndicatorsSnapshotFilters;
};

export const indicatorsInfinitySnapshotBank = createBank({
    createKey: ({ request, requestStream, sort, filters, url }: TProps) => {
        return semanticHash.get(
            {
                url,
                request,
                requestStream,
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
    createValue: (key, { request, requestStream, url, sort, filters }: TProps) => {
        function fetch$(traceId: TraceId, offset: number, limit: number) {
            return fetchIndicatorsSnapshotHandle(
                request,
                url,
                { params: { limit, offset }, sort, filters },
                { traceId },
            ).pipe(map((envelope) => createSyncedValueDescriptor(envelope.payload.entities)));
        }

        // platformTime its filter for historical requests
        const subscribe$ =
            filters?.platformTime === undefined
                ? (traceId: TraceId) => {
                      return subscribeToIndicatorsHandle(requestStream, url, filters, {
                          traceId,
                          ...NO_RETRIES,
                          ...UPDATES_ONLY,
                      }).pipe(
                          convertToSubscriptionEvent((payload) => payload.indicators),
                          map(createSyncedValueDescriptor),
                      );
                  }
                : undefined;

        return new InfinitySnapshot<TIndicator>({
            fetch: fetch$,
            subscribe: subscribe$,
            getKey: (item) => item.key,
            sortPredicate: getSortBacktestingTasksPredicate(sort ?? EMPTY_OBJECT),
        });
    },

    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
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

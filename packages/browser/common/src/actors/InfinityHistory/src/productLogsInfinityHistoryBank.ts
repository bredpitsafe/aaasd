import { map } from 'rxjs/operators';

import { EFetchHistoryDirection, NO_RETRIES, UPDATES_ONLY } from '../../../handlers/def';
import { TProductLogFilters } from '../../../handlers/productLogs/defs';
import { fetchProductLogsHandler } from '../../../handlers/productLogs/fetchProductLogsHandler';
import { subscribeToProductLogsHandle } from '../../../handlers/productLogs/subscribeToProductLogsHandle';
import { productLogsFiltersHashDescriptor } from '../../../handlers/productLogs/utils';
import { convertToSubscriptionEvent } from '../../../handlers/utils';
import { IModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TSocketURL } from '../../../types/domain/sockets';
import { ISO } from '../../../types/time';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';

type TProps = {
    request: IModuleCommunicationHandlersRemoted['request'];
    requestStream: IModuleCommunicationHandlersRemoted['requestStream'];
    url: TSocketURL;
    filters: TProductLogFilters;
};

export const productLogsInfinityHistoryBank = createBank({
    createKey: (props: TProps) => {
        return semanticHash.get(props, {
            request: semanticHash.withHasher(shallowHash),
            requestStream: semanticHash.withHasher(shallowHash),
            filters: productLogsFiltersHashDescriptor,
        });
    },
    createValue: (key, { request, requestStream, url, filters }) => {
        function fetch$(
            traceId: TraceId,
            count: number,
            start: ISO,
            startInclude: boolean,
            end: ISO,
            endInclude: boolean,
        ) {
            return fetchProductLogsHandler(
                request,
                url,
                {
                    limit: Math.abs(count),
                    direction:
                        count > 0
                            ? EFetchHistoryDirection.Forward
                            : EFetchHistoryDirection.Backward,
                    timestamp: start,
                    timestampExcluded: !startInclude,
                    timestampBound: end,
                    timestampBoundExcluded: !endInclude,
                },
                filters,
                { traceId },
            ).pipe(map((envelope) => createSyncedValueDescriptor(envelope.payload.productLog)));
        }

        function subscribe$(traceId: TraceId) {
            return subscribeToProductLogsHandle(requestStream, url, filters, {
                traceId,
                ...NO_RETRIES,
                ...UPDATES_ONLY,
            }).pipe(
                convertToSubscriptionEvent((payload) => payload.updates),
                map(createSyncedValueDescriptor),
            );
        }

        return new InfinityHistory(
            (v) => v.fingerprint,
            (v) => v.platformTime,
            fetch$,
            subscribe$,
            filters.backtestingRunId !== undefined,
        );
    },
    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
    ),
    onRemove: (key, value) => value.destroy(),
});

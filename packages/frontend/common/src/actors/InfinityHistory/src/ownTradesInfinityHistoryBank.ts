import { map } from 'rxjs/operators';

import { EFetchHistoryDirection, NO_RETRIES, UPDATES_ONLY } from '../../../handlers/def';
import {
    fetchOwnTradesHandle,
    TFetchOwnTradesFilters,
} from '../../../handlers/ownTrades/fetchOwnTradesHandle';
import { subscribeToOwnTradesHandle } from '../../../handlers/ownTrades/subscribeOwnTradesHandle';
import { fetchOwnTradesFiltersHashDescriptor } from '../../../handlers/ownTrades/utils';
import { convertToSubscriptionEvent } from '../../../handlers/utils';
import type { IModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { TSocketURL } from '../../../types/domain/sockets';
import { EDateTimeFormats, ISO, TimeZone } from '../../../types/time';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { getNowDayjs } from '../../../utils/time';
import type { TraceId } from '../../../utils/traceId';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';

type TProps = {
    request: IModuleCommunicationHandlersRemoted['request'];
    requestStream: IModuleCommunicationHandlersRemoted['requestStream'];
    url: TSocketURL;
    filters: TFetchOwnTradesFilters;
    timeZone: TimeZone;
};

export const ownTradesInfinityHistoryBank = createBank({
    createKey: (props: TProps) => {
        return semanticHash.get(props, {
            request: semanticHash.withHasher(shallowHash),
            requestStream: semanticHash.withHasher(shallowHash),
            filters: fetchOwnTradesFiltersHashDescriptor,
        });
    },
    createValue: (key, { request, requestStream, url, filters, timeZone }: TProps) => {
        function fetch$(
            traceId: TraceId,
            count: number,
            start: ISO,
            startInclude: boolean,
            end: ISO,
            endInclude: boolean,
        ) {
            return fetchOwnTradesHandle(
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
            ).pipe(map(({ payload }) => createSyncedValueDescriptor(payload.ownTrades)));
        }
        function subscribe$(traceId: TraceId) {
            return subscribeToOwnTradesHandle(
                requestStream,
                url,
                {
                    ...filters,
                    date: getNowDayjs(timeZone).format(EDateTimeFormats.Date),
                    timeZone,
                },
                { traceId, ...NO_RETRIES, ...UPDATES_ONLY },
            ).pipe(
                convertToSubscriptionEvent((payload) => payload.ownTrades),
                map(createSyncedValueDescriptor),
            );
        }

        return new InfinityHistory({
            getId: (v) => v.tradeId,
            getTime: (v) => v.platformTime,
            fetch: fetch$,
            subscribe: subscribe$,
        });
    },
    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
    ),
    onRemove: (key, value) => value.destroy(),
});

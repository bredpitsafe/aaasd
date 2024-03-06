import { isUndefined, omit } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EFetchSortOrder, NO_RETRIES, UPDATES_ONLY } from '../../handlers/def';
import {
    fetchOrdersSnapshotHandle,
    TOrdersSnapshotFilters,
    TOrdersSnapshotSortOrder,
} from '../../handlers/orders/fetchOrdersSnapshotHandle';
import { subscribeToOrdersHandle } from '../../handlers/orders/subscribeToOrdersHandle';
import { convertToSubscriptionEvent } from '../../handlers/utils';
import { IModuleCommunicationHandlersRemoted } from '../../modules/communicationRemoteHandlers';
import { EOrderStatus, TActiveOrder } from '../../types/domain/orders';
import { TRobotId } from '../../types/domain/robots';
import { TSocketURL } from '../../types/domain/sockets';
import { createBank } from '../../utils/Bank';
import { debounceBy } from '../../utils/debounceBy';
import { InfinitySnapshot } from '../../utils/InfinitySnapshot';
import { TSubscriptionEvent } from '../../utils/Rx/subscriptionEvents';
import { semanticHash } from '../../utils/semanticHash';
import { shallowHash } from '../../utils/shallowHash';
import { TraceId } from '../../utils/traceId';
import { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from '../InfinityHistory/src/def';

type TProps = {
    request: IModuleCommunicationHandlersRemoted['request'];
    requestStream: IModuleCommunicationHandlersRemoted['requestStream'];
    url: TSocketURL;
    sort?: TOrdersSnapshotSortOrder;
    filters?: TOrdersSnapshotFilters;
};

export const ordersInfinitySnapshotBank = createBank({
    createKey: (props: TProps) => {
        return semanticHash.get(props, {
            request: semanticHash.withHasher(shallowHash),
            requestStream: semanticHash.withHasher(shallowHash),
            filters: {
                robotIds: semanticHash.withSorter<TRobotId>((a, b) => b - a),
                statuses: semanticHash.withSorter<EOrderStatus>((a, b) => b.localeCompare(a)),
            },
            sort: semanticHash.withSorter(null),
        });
    },
    createValue: (key, { request, requestStream, url, sort, filters }: TProps) => {
        function fetch$(
            traceId: TraceId,
            offset: number,
            limit: number,
        ): Observable<TValueDescriptor2<TActiveOrder[]>> {
            return fetchOrdersSnapshotHandle(
                request,
                url,
                { sort, filters, limit, offset },
                { traceId },
            ).pipe(map((envelope) => createSyncedValueDescriptor(envelope.payload.entities)));
        }

        function subscribe$(
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TSubscriptionEvent<TActiveOrder[]>>> {
            return subscribeToOrdersHandle(requestStream, url, omit(filters, 'statuses'), {
                traceId,
                ...NO_RETRIES,
                ...UPDATES_ONLY,
            }).pipe(
                convertToSubscriptionEvent((payload) => payload.orders),
                map(createSyncedValueDescriptor),
            );
        }

        return new InfinitySnapshot<TActiveOrder>({
            fetch: fetch$,
            subscribe: subscribe$,
            getKey: (v) => v.orderId,
            deletePredicate: selectFinishedOrder,
            sortPredicate: getSortOrdersPredicate(sort),
        });
    },

    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
    ),

    onRemove: (key, value) => value.destroy(),
});

function selectFinishedOrder(order: TActiveOrder): boolean {
    return (
        order.status === EOrderStatus.Canceled ||
        order.status === EOrderStatus.Filled ||
        order.status === EOrderStatus.Rejected
    );
}

function getSortOrdersPredicate(sort?: TOrdersSnapshotSortOrder) {
    return function sortPredicate(a: TActiveOrder, b: TActiveOrder): number {
        if (isUndefined(sort)) return 0;

        for (const [field, order] of sort) {
            const aField = a[field];
            const bField = b[field];

            if (aField > bField) {
                return order === EFetchSortOrder.Asc ? 1 : -1;
            }
            if (aField < bField) {
                return order === EFetchSortOrder.Asc ? -1 : 1;
            }
        }

        return 0;
    };
}

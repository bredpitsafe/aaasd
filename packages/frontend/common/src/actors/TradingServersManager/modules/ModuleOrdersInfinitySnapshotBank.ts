import type { TSubscriptionEvent } from '@common/rx';
import type { TraceId } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { isUndefined, omit } from 'lodash-es';
import type { Observable } from 'rxjs';

import { ModuleFactory } from '../../../di';
import { EFetchSortOrder, NO_RETRIES, UPDATES_ONLY } from '../../../modules/actions/def.ts';
import type { TActiveOrder } from '../../../types/domain/orders.ts';
import { EOrderStatus } from '../../../types/domain/orders.ts';
import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from '../../InfinityHistory/src/def.ts';
import type {
    TOrdersSnapshotFilters,
    TOrdersSnapshotSortOrder,
} from './actions/ModuleFetchOrdersSnapshot.ts';
import { ModuleFetchOrdersSnapshot } from './actions/ModuleFetchOrdersSnapshot.ts';
import { ModuleSubscribeToActiveOrders } from './actions/ModuleSubscribeToActiveOrders.ts';

type TProps = TWithSocketTarget & {
    sort?: TOrdersSnapshotSortOrder;
    filters?: TOrdersSnapshotFilters;
};

export const ModuleOrdersInfinitySnapshotBank = ModuleFactory((ctx) => {
    const fetchOrders = ModuleFetchOrdersSnapshot(ctx);
    const subscribeToOrders = ModuleSubscribeToActiveOrders(ctx);

    return createBank({
        logger: logger.child(new Binding('OrdersBank')),
        createKey: (props: TProps) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TProps['filters']>((filters) =>
                        semanticHash.get(filters, {
                            robotIds: semanticHash.withSorter<TRobotId>((a, b) => b - a),
                            statuses: semanticHash.withSorter<EOrderStatus>((a, b) =>
                                b.localeCompare(a),
                            ),
                        }),
                    ),
                },
                sort: semanticHash.withSorter(null),
            }),
        createValue: (key, { target, sort, filters }: TProps) => {
            const fetch = (
                traceId: TraceId,
                offset: number,
                limit: number,
            ): Observable<TValueDescriptor2<TActiveOrder[]>> => {
                return fetchOrders(
                    { target, sort, filters, params: { limit, offset } },
                    { traceId },
                ).pipe(
                    mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.entities)),
                );
            };

            const subscribe = (
                traceId: TraceId,
            ): Observable<TValueDescriptor2<TSubscriptionEvent<TActiveOrder[]>>> => {
                return subscribeToOrders(
                    {
                        target,
                        ...omit(filters, 'statuses'),
                        ...UPDATES_ONLY,
                    },
                    {
                        traceId,
                        ...NO_RETRIES,
                    },
                );
            };

            return new InfinitySnapshot<TActiveOrder>({
                fetch,
                subscribe,
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

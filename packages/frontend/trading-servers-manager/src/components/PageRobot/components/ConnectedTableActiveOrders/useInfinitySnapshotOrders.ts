import { generateTraceId } from '@common/utils';
import type {
    TOrdersSnapshotFilters,
    TOrdersSnapshotSortOrder,
} from '@frontend/common/src/actors/TradingServersManager/modules/actions/ModuleFetchOrdersSnapshot.ts';
import type { TInfinityHistoryItemsFetchProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useInfinityHistoryItems } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleFetchOrdersSnapshot } from '@frontend/common/src/modules/actions/orders/ModuleFetchOrdersSnapshot.ts';
import { ModuleSubscribeToOrdersUpdates } from '@frontend/common/src/modules/actions/orders/ModuleSubscribeToOrdersUpdates.ts';
import type { TActiveOrder } from '@frontend/common/src/types/domain/orders';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isEqual } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { BehaviorSubject, distinctUntilChanged, exhaustMap, switchMap, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { TTableActiveOrdersFilterModel } from '../../../Tables/TableActiveOrders';

export function useInfinitySnapshotOrders(
    url: TSocketURL,
    filters: TOrdersSnapshotFilters,
    onUpdate: () => unknown,
) {
    const fetchOrders = useModule(ModuleFetchOrdersSnapshot);
    const subscribeToOrders = useModule(ModuleSubscribeToOrdersUpdates);
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);

    const sortAndFilters$ = useMemo(
        () =>
            new BehaviorSubject<
                undefined | { sort: TOrdersSnapshotSortOrder; filters: TOrdersSnapshotFilters }
            >(undefined),
        [],
    );
    const traceId = useMemo(
        () => generateTraceId(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [url, filters],
    );

    const fetch = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TActiveOrder, TTableActiveOrdersFilterModel>) => {
            const fullFilters = {
                ...filters,
                gateName: params.filter.gateName?.filter.trim(),
                accountName: params.filter.accountName?.filter.trim(),
                instrumentName: params.filter.instrumentName?.filter.trim(),
                side: params.filter.side?.value,
                timeInForce: params.filter.timeInForce?.value,
            };

            sortAndFilters$.next({
                sort: params.sort as TOrdersSnapshotSortOrder,
                filters: fullFilters,
            });

            return timer(300).pipe(
                exhaustMap(() =>
                    fetchOrders(
                        {
                            target: url,
                            params: {
                                offset: params.offset,
                                limit: params.limit,
                            },
                            sort: params.sort as TOrdersSnapshotSortOrder,
                            filters: fullFilters,
                        },
                        { traceId },
                    ).pipe(notifyErrorAndFail(), extractSyncedValueFromValueDescriptor()),
                ),
                tap(onUpdate),
            );
        },
        [filters, sortAndFilters$, onUpdate, fetchOrders, url, traceId, notifyErrorAndFail],
    );
    const subscribe = useCallback(() => {
        return timer(300).pipe(
            exhaustMap(() => sortAndFilters$),
            distinctUntilChanged(isEqual),
            switchMap((params) => subscribeToOrders({ target: url, ...params }, { traceId })),
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
            tap(onUpdate),
        );
    }, [notifyErrorAndFail, onUpdate, sortAndFilters$, subscribeToOrders, url, traceId]);

    return useInfinityHistoryItems<TActiveOrder, TTableActiveOrdersFilterModel>(
        (v) => v.orderId,
        fetch,
        subscribe,
    );
}

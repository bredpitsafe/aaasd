import {
    TInfinityHistoryItemsFetchProps,
    useInfinityHistoryItems,
} from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import {
    TOrdersSnapshotFilters,
    TOrdersSnapshotSortOrder,
} from '@frontend/common/src/handlers/orders/fetchOrdersSnapshotHandle';
import { ModuleOrders } from '@frontend/common/src/modules/actions/orders';
import { TActiveOrder } from '@frontend/common/src/types/domain/orders';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isEqual } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import {
    BehaviorSubject,
    concatMapTo,
    distinctUntilChanged,
    exhaustMap,
    switchMap,
    timer,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import { TTableActiveOrdersFilterModel } from '../../../Tables/TableActiveOrders';

export function useInfinitySnapshotOrders(
    url: TSocketURL,
    filters: TOrdersSnapshotFilters,
    onUpdate: () => unknown,
) {
    const { getOrders, subscribeToOrders } = useModule(ModuleOrders);
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

    const fetch$ = useCallback(
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
                    getOrders(
                        url,
                        {
                            offset: params.offset,
                            limit: params.limit,
                            sort: params.sort as TOrdersSnapshotSortOrder,
                            filters: fullFilters,
                        },
                        { traceId },
                    ),
                ),
                tap(onUpdate),
            );
        },
        [filters, sortAndFilters$, onUpdate, getOrders, url, traceId],
    );
    const subscribe$ = useCallback(() => {
        return timer(300).pipe(
            concatMapTo(sortAndFilters$),
            distinctUntilChanged(isEqual),
            switchMap((params) => subscribeToOrders(url, params, { traceId })),
            tap(onUpdate),
        );
    }, [onUpdate, sortAndFilters$, subscribeToOrders, url, traceId]);

    return useInfinityHistoryItems<TActiveOrder, TTableActiveOrdersFilterModel>(
        (v) => v.orderId,
        fetch$,
        subscribe$,
    );
}

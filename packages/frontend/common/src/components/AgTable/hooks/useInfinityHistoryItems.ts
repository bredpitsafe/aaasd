import type { TSubscriptionEvent } from '@common/rx';
import { isSubscriptionEventSubscribed, isSubscriptionEventUpdate } from '@common/rx';
import type { SortModelItem } from '@frontend/ag-grid';
import { useEffect, useMemo } from 'react';
import { useUnmount } from 'react-use';
import type { Observable } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import type { TFetchSortFieldsOrder } from '../../../modules/actions/def.ts';
import { EFetchSortOrder } from '../../../modules/actions/def.ts';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import type { TDataSourceGetRowsProps } from './useInfinityDataSource';

export type TInfinityHistoryItemsFetchProps<
    Row extends Record<string, unknown>,
    Filter = unknown,
> = {
    lastRow: undefined | Row;
    offset: number;
    limit: number;
    sort: undefined | TFetchSortFieldsOrder<Row>;
    filter: Filter;
};
export type TInfinityHistoryItemsSubscribe<T> = () => Observable<T>;
export type TInfinityHistoryItemsFetch<Row extends Record<string, unknown>, Filter = unknown> = (
    props: TInfinityHistoryItemsFetchProps<Row, Filter>,
) => Observable<Row[]>;

export type TUseInfinityHistoryItemsReturnType<
    Row extends Record<string, unknown>,
    Filter = unknown,
> = {
    getItems$: (p: TDataSourceGetRowsProps<Row, Filter>) => Observable<Row[]>;
    updateTrigger$: Subject<void>;
};

export function useInfinityHistoryItems<Item extends Record<string, unknown>, Filter = unknown>(
    getId: (item: Item) => unknown,
    fetch: TInfinityHistoryItemsFetch<Item, Filter>,
    subscribe?: undefined | TInfinityHistoryItemsSubscribe<TSubscriptionEvent<Item[]>>,
): TUseInfinityHistoryItemsReturnType<Item, Filter> {
    const abortTrigger$ = useMemo(() => new Subject<void>(), []);
    const updateTrigger$ = useMemo(() => new Subject<void>(), []);

    const getItems$ = useMemo(
        () => {
            abortTrigger$.next();

            return (p: TDataSourceGetRowsProps<Item, Filter>) => {
                const limit = p.endIndex - p.startIndex;
                return fetch({
                    // plus one for intersection with last row
                    limit: limit + (p.lastRow !== undefined ? 1 : 0),
                    offset: p.startIndex,
                    lastRow: p.lastRow,
                    sort: transformAgGridSortModel(p.sortModel),
                    filter: p.filterModel,
                }).pipe(
                    map((items) => {
                        if (
                            p.lastRow !== undefined &&
                            items.length > 0 &&
                            getId(items[0]) === getId(p.lastRow)
                        ) {
                            items = items.slice(1);
                        }

                        if (items.length > limit) {
                            items = items.slice(0, limit);
                        }

                        return items;
                    }),
                    progressiveRetry(),
                    takeUntil(abortTrigger$),
                );
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fetch],
    );

    useEffect(
        () => {
            if (subscribe === undefined) return;

            const subscription = subscribe()
                .pipe(
                    filter(
                        (event) =>
                            isSubscriptionEventUpdate(event) ||
                            isSubscriptionEventSubscribed(event),
                    ),
                )
                .subscribe(() => updateTrigger$.next());

            return () => {
                subscription.unsubscribe();
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [subscribe, updateTrigger$, abortTrigger$],
    );

    useUnmount(() => {
        abortTrigger$.next();
        abortTrigger$.complete();
        updateTrigger$.complete();
    });

    return useMemo(
        () => ({
            getItems$,
            updateTrigger$,
        }),
        [getItems$, updateTrigger$],
    );
}

function transformAgGridSortModel<T extends Record<string, unknown>>(
    sortModel: Array<SortModelItem>,
): TFetchSortFieldsOrder<T> | undefined {
    return sortModel.length > 0
        ? sortModel.map(({ colId, sort }) => {
              return [colId, sort === 'desc' ? EFetchSortOrder.Desc : EFetchSortOrder.Asc];
          })
        : undefined;
}

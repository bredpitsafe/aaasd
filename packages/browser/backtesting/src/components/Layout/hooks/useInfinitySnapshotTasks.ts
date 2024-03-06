import {
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSortOrder,
} from '@frontend/common/src/actors/BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import {
    TInfinityHistoryItemsFetchProps,
    useInfinityHistoryItems,
} from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isEqual, isFinite, isString } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { BehaviorSubject, distinctUntilChanged, exhaustMap, switchMap, timer } from 'rxjs';

import { ModuleBacktestingTaskLookupsDataProvider } from '../../../modules/actions/ModuleBacktestingTaskLookupsDataProvider';

const getId = (v: TBacktestingTask) => v.id;

type TSubscribeParams = {
    sort: undefined | TBacktestingTasksSnapshotSortOrder;
    filters: undefined | TBacktestingTasksSnapshotFilters;
};

type TFilterModel = {
    filter?: {
        btRuns?: { filter?: string };
        id?: { filter?: string };
        name?: { filter?: string };
        user?: { filter?: string };
    };
};

export function useInfinitySnapshotTasks(url: TSocketURL) {
    const {
        fetch: fetchBacktestingTaskLookupsRemotely,
        subscribe: subscribeToBacktestingTaskLookupsRemotely,
    } = useModule(ModuleBacktestingTaskLookupsDataProvider);
    const subscriptionParams$ = useMemo(
        () => new BehaviorSubject<TSubscribeParams>({ sort: undefined, filters: undefined }),
        [],
    );

    const fetch$ = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TBacktestingTask>) => {
            const filters = createFiltersForRequest(params);
            subscriptionParams$.next({
                sort: params.sort as TBacktestingTasksSnapshotSortOrder,
                filters,
            });

            return timer(300).pipe(
                exhaustMap(() =>
                    fetchBacktestingTaskLookupsRemotely(
                        url,
                        {
                            offset: params.offset,
                            limit: params.limit,
                            sort: params.sort as TBacktestingTasksSnapshotSortOrder,
                            filters,
                        },
                        { traceId: generateTraceId() },
                    ),
                ),
            );
        },
        [fetchBacktestingTaskLookupsRemotely, subscriptionParams$, url],
    );

    const subscribe$ = useCallback(() => {
        return timer(300).pipe(
            exhaustMap(() => subscriptionParams$),
            distinctUntilChanged<TSubscribeParams>(isEqual),
            switchMap((params) =>
                subscribeToBacktestingTaskLookupsRemotely(url, params, {
                    traceId: generateTraceId(),
                }),
            ),
        );
    }, [subscriptionParams$, subscribeToBacktestingTaskLookupsRemotely, url]);

    return useInfinityHistoryItems<TBacktestingTask>(getId, fetch$, subscribe$);
}

function createFiltersForRequest(
    params: TInfinityHistoryItemsFetchProps<TBacktestingTask>,
): TBacktestingTasksSnapshotFilters | undefined {
    const castedParams = params as TFilterModel;

    return {
        ids: makeIntArrayFromFilterString(castedParams.filter?.id?.filter),
        btRuns: makeIntArrayFromFilterString(castedParams.filter?.btRuns?.filter),
        names: makeStringArrayFromFilterString(castedParams.filter?.name?.filter),
        authors: makeStringArrayFromFilterString(castedParams.filter?.user?.filter),
    };
}

function makeIntArrayFromFilterString(value: string | undefined): number[] | undefined {
    return isString(value)
        ? value
              .split(/[,.;:\s]/)
              .map((str) => str.trim())
              .map((str) => parseInt(str))
              .filter(isFinite)
        : undefined;
}

function makeStringArrayFromFilterString(value: string | undefined): string[] | undefined {
    return isString(value) ? value.split(',').map((str) => str.trim()) : undefined;
}

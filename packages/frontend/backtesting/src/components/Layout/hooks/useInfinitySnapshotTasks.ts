import { generateTraceId } from '@common/utils';
import type {
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSortOrder,
} from '@frontend/common/src/actors/BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import type { TInfinityHistoryItemsFetchProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useInfinityHistoryItems } from '@frontend/common/src/components/AgTable/hooks/useInfinityHistoryItems';
import { useModule } from '@frontend/common/src/di/react';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
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

export function useInfinitySnapshotTasks(target: TSocketURL) {
    const {
        fetch: fetchBacktestingTaskLookupsRemotely,
        subscribe: subscribeToBacktestingTaskLookupsRemotely,
    } = useModule(ModuleBacktestingTaskLookupsDataProvider);
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    const subscriptionProps$ = useMemo(
        () => new BehaviorSubject<TSubscribeParams>({ sort: undefined, filters: undefined }),
        [],
    );

    const fetch = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TBacktestingTask>) => {
            const filters = createFiltersForRequest(params);
            subscriptionProps$.next({
                sort: params.sort as TBacktestingTasksSnapshotSortOrder,
                filters,
            });

            return timer(300).pipe(
                exhaustMap(() =>
                    fetchBacktestingTaskLookupsRemotely(
                        {
                            target,
                            params: {
                                offset: params.offset,
                                limit: params.limit,
                            },
                            sort: {
                                fieldsOrder: params.sort as TBacktestingTasksSnapshotSortOrder,
                            },
                            filters,
                        },
                        { traceId: generateTraceId() },
                    ).pipe(notifyErrorAndFail(), extractSyncedValueFromValueDescriptor()),
                ),
            );
        },
        [fetchBacktestingTaskLookupsRemotely, notifyErrorAndFail, subscriptionProps$, target],
    );

    const subscribe = useCallback(() => {
        return timer(300).pipe(
            exhaustMap(() => subscriptionProps$),
            distinctUntilChanged<TSubscribeParams>(isEqual),
            switchMap((props) =>
                subscribeToBacktestingTaskLookupsRemotely(
                    { target, filters: props.filters, sort: { fieldsOrder: props.sort } },
                    { traceId: generateTraceId() },
                ),
            ),
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
        );
    }, [notifyErrorAndFail, subscriptionProps$, subscribeToBacktestingTaskLookupsRemotely, target]);

    return useInfinityHistoryItems<TBacktestingTask>(getId, fetch, subscribe);
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

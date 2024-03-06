import { isUndefined } from 'lodash-es';
import { Observable } from 'rxjs';

import { TContextRef } from '../../../di';
import { EFetchSortOrder, NO_RETRIES, UPDATES_ONLY } from '../../../handlers/def';
import { EBacktestingTaskStatus, TBacktestingTask } from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot';
import { TSubscriptionEvent } from '../../../utils/Rx/subscriptionEvents';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';
import { Binding } from '../../../utils/Tracing/Children/Binding';
import { loggerInfinitySnapshot } from '../../../utils/Tracing/Children/infinitySnapshot';
import { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import {
    ModuleFetchBacktestingTasksSnapshot,
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSortOrder,
} from '../../BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import { ModuleSubscribeToBacktestingTasks } from '../../BacktestingDataProviders/actions/ModuleSubscribeToBacktestingTasks';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';

type TProps = {
    ctx: TContextRef;
    url: TSocketURL;
    sort: undefined | TBacktestingTasksSnapshotSortOrder;
    filters?: TBacktestingTasksSnapshotFilters;
};

export const backtestingTasksInfinitySnapshotBank = createBank({
    createKey: (props: TProps) => {
        return semanticHash.get(props, {
            ctx: semanticHash.withHasher(shallowHash),
            sort: semanticHash.withSorter(null),
            filters: {
                btRuns: semanticHash.withSorter(null),
                ids: semanticHash.withSorter(null),
                names: semanticHash.withSorter(null),
                authors: semanticHash.withSorter(null),
            },
        });
    },
    createValue: (key, { ctx, url, sort, filters }: TProps) => {
        const fetch = ModuleFetchBacktestingTasksSnapshot(ctx);
        const subscribe = ModuleSubscribeToBacktestingTasks(ctx);

        function fetch$(
            traceId: TraceId,
            offset: number,
            limit: number,
        ): Observable<TValueDescriptor2<TBacktestingTask[]>> {
            return fetch(
                {
                    target: url,
                    sort: { fieldsOrder: sort },
                    slice: { limit, offset },
                    mods: {
                        withTotal: false,
                    },
                    filters,
                },
                { traceId },
            );
        }

        function subscribe$(
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TSubscriptionEvent<TBacktestingTask[]>>> {
            return subscribe(
                {
                    target: url,
                    filters,
                    ...UPDATES_ONLY,
                },
                {
                    traceId,
                    ...NO_RETRIES,
                },
            );
        }

        return new InfinitySnapshot<TBacktestingTask>({
            fetch: fetch$,
            subscribe: subscribe$,
            getKey: (v) => v.id,
            deletePredicate: isArchivedTasks,
            sortPredicate: getSortBacktestingTasksPredicate(sort),
            logger: loggerInfinitySnapshot.child(new Binding('BacktestingTasks')),
        });
    },

    onRelease: debounceBy(
        (key, value, bank) => bank.removeIfDerelict(key),
        ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
    ),

    onRemove: (key, value) => value.destroy(),
});

function isArchivedTasks(task: TBacktestingTask): boolean {
    return task.status === EBacktestingTaskStatus.Archived;
}

function getSortBacktestingTasksPredicate(sort: undefined | TBacktestingTasksSnapshotSortOrder) {
    return function sortPredicate(a: TBacktestingTask, b: TBacktestingTask): number {
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

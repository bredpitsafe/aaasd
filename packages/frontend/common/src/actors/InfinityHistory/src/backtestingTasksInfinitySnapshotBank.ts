import type { TSubscriptionEvent } from '@common/rx';
import type { TraceId } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';

import { ModuleFactory } from '../../../di';
import { EFetchSortOrder } from '../../../modules/actions/def.ts';
import type { TBacktestingTask } from '../../../types/domain/backtestings';
import { EBacktestingTaskStatus } from '../../../types/domain/backtestings';
import type { TWithSocketTarget } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinitySnapshot } from '../../../utils/InfinitySnapshot';
import { semanticHash } from '../../../utils/semanticHash';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import type {
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSort,
    TBacktestingTasksSnapshotSortOrder,
} from '../../BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import { ModuleFetchBacktestingTasksSnapshot } from '../../BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import { ModuleSubscribeToBacktestingTasks } from '../../BacktestingDataProviders/actions/ModuleSubscribeToBacktestingTasks';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';

export type TBacktestingTasksInfinitySnapshotBankProps = TWithSocketTarget & {
    sort?: TBacktestingTasksSnapshotSort;
    filters?: TBacktestingTasksSnapshotFilters;
};

export const ModuleBacktestingTasksInfinitySnapshotBank = ModuleFactory((ctx) => {
    const fetchTasks = ModuleFetchBacktestingTasksSnapshot(ctx);
    const subscribeToTasks = ModuleSubscribeToBacktestingTasks(ctx);

    return createBank({
        logger: logger.child(new Binding('BTTasksBank')),
        createKey: (props: TBacktestingTasksInfinitySnapshotBankProps) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                sort: {
                    fieldsOrder: semanticHash.withSorter(null),
                },
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<
                        TBacktestingTasksInfinitySnapshotBankProps['filters']
                    >((filters) =>
                        semanticHash.get(filters, {
                            btRuns: semanticHash.withSorter(null),
                            ids: semanticHash.withSorter(null),
                            names: semanticHash.withSorter(null),
                            authors: semanticHash.withSorter(null),
                        }),
                    ),
                },
            }),
        createValue: (key, { target, sort, filters }) => {
            function fetch(
                traceId: TraceId,
                offset: number,
                limit: number,
            ): Observable<TValueDescriptor2<TBacktestingTask[]>> {
                return fetchTasks(
                    {
                        target,
                        params: { limit, offset },
                        sort,
                        filters,
                        mods: { withTotal: false },
                    },
                    { traceId },
                );
            }

            function subscribe(
                traceId: TraceId,
            ): Observable<TValueDescriptor2<TSubscriptionEvent<TBacktestingTask[]>>> {
                return subscribeToTasks(
                    {
                        target,
                        filters,
                        mods: { updatesOnly: true },
                    },
                    {
                        traceId,
                        enableRetries: false,
                    },
                );
            }

            return new InfinitySnapshot<TBacktestingTask>({
                fetch,
                subscribe,
                getKey: (v) => v.id,
                deletePredicate: isArchivedTasks,
                sortPredicate: getSortBacktestingTasksPredicate(sort?.fieldsOrder),
            });
        },

        onRelease: debounceBy(
            (key, value, bank) => bank.removeIfDerelict(key),
            ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
        ),

        onRemove: (key, value) => value.destroy(),
    });
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

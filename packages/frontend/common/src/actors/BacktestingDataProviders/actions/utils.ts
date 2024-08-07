import type { TBacktestingTask } from '../../../types/domain/backtestings.ts';
import type { TBacktestingTasksSnapshotSortOrder } from './ModuleFetchBacktestingTasksSnapshot.ts';

export const backtestingTaskLookupSortableFields: (keyof TBacktestingTask)[] = ['id'];

export function selectOnlyAvailableSortableFields(sort: TBacktestingTasksSnapshotSortOrder) {
    return sort.filter(([field]) => backtestingTaskLookupSortableFields.includes(field));
}

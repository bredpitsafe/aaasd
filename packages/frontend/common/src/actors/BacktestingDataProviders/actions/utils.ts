import { TBacktestingTask } from '../../../types/domain/backtestings.ts';
import { TBacktestingTasksSnapshotSortOrder } from './ModuleFetchBacktestingTasksSnapshot.ts';

export const backtestingTaskLookupSortableFields: (keyof TBacktestingTask)[] = ['id'];

export function selectOnlyAvailableSortableFields(sort: TBacktestingTasksSnapshotSortOrder) {
    return sort.filter(([field]) => backtestingTaskLookupSortableFields.includes(field));
}

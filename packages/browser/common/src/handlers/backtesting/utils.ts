import { TBacktestingTasksSnapshotSortOrder } from '../../actors/BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import { TBacktestingTask } from '../../types/domain/backtestings';

export const backtestingTaskLookupSortableFields: (keyof TBacktestingTask)[] = ['id'];

export function selectOnlyAvailableSortableFields(sort: TBacktestingTasksSnapshotSortOrder) {
    return sort.filter(([field]) => backtestingTaskLookupSortableFields.includes(field));
}

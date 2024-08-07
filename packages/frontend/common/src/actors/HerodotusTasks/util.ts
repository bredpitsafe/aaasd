import { compareDates } from '@common/utils';

import type { THerodotusTask } from '../../../../herodotus/src/types/domain';

export function sortTasks(tasks: Array<THerodotusTask>): Array<THerodotusTask> {
    return tasks.slice().sort((a, b) => (a.taskId > b.taskId ? -1 : 1));
}

export function selectFreshTask(first: THerodotusTask | undefined, second: THerodotusTask) {
    return first === undefined || compareDates(second.lastChangedTs, first.lastChangedTs) >= 0
        ? second
        : first;
}

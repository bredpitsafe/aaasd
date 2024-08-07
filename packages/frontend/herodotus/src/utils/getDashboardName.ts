import { isUndefined, padStart } from 'lodash-es';

import type { THerodotusTask } from '../types/domain';

export const getDashboardName = (
    task: Pick<THerodotusTask, 'dashboardName' | 'taskId'>,
): string | null => {
    if (!isUndefined(task.dashboardName)) {
        return task.dashboardName;
    }

    return `T${padStart(String(task.taskId), 4, '0')}`;
};

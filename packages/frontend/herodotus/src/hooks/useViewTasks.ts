import type { TRobotId } from '@frontend/common/src/types/domain/robots';

import type { THerodotusTaskView } from '../types';
import type { THerodotusTask } from '../types/domain';
import { getHerodotusTaskViewItem } from '../utils/getHerodotusTaskViewItem';

export const useViewTasks = (
    tasks: THerodotusTask[] | undefined,
    robotId: TRobotId,
): THerodotusTaskView[] | undefined => {
    return tasks?.map((item) => getHerodotusTaskViewItem(item, robotId));
};

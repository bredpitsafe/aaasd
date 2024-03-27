import { TRobotId } from '@frontend/common/src/types/domain/robots';

import { THerodotusTaskView } from '../types';
import { THerodotusTask } from '../types/domain';
import { getHerodotusTaskViewItem } from '../utils/getHerodotusTaskViewItem';

export const useViewTasks = (
    tasks: THerodotusTask[] | undefined,
    robotId: TRobotId,
): THerodotusTaskView[] | undefined => {
    return tasks?.map((item) => getHerodotusTaskViewItem(item, robotId));
};

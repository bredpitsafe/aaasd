import type { TBacktestingTaskRobot } from '@frontend/common/src/types/domain/backtestings';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';

export function getRobotHash(robot: TBacktestingTaskRobot | TRobot) {
    return shallowHash(robot.name, robot.kind);
}

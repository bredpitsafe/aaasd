import type { Nil } from '@common/types';

import type { TRobot } from '../../types/domain/robots';
import { EHerodotusVersion, ERobotClass } from '../../types/domain/robots';

export function isHerodotus(robot: Nil | TRobot): boolean {
    return robot?.kind == ERobotClass.TradingTasks || robot?.kind == ERobotClass.Herodotus;
}

export function getHerodotusVersion(robotKind: string): EHerodotusVersion {
    return robotKind === ERobotClass.Herodotus ? EHerodotusVersion.v2 : EHerodotusVersion.v1;
}

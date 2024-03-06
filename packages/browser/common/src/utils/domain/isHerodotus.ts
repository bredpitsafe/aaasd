import { EHerodotusVersion, ERobotClass, TRobot } from '../../types/domain/robots';

export function isHerodotus(robot?: TRobot): boolean {
    return robot?.kind == ERobotClass.TradingTasks || robot?.kind == ERobotClass.Herodotus;
}

export function getHerodotusVersion(robotKind: string): EHerodotusVersion {
    return robotKind === ERobotClass.Herodotus ? EHerodotusVersion.v2 : EHerodotusVersion.v1;
}

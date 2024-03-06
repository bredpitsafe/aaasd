import { EComponentStatus, Opaque, TOrder } from '../index';
import { TWithBuildInfo } from './buildInfo';

export enum ERobotClass {
    Herodotus = 'HerodotusMulti',
    TradingTasks = 'trading_tasks',
    TestQuoterRobot = 'test_quoter_robot',
    TestIndicatorRobot = 'test_indicator_robot',
}

export enum EHerodotusVersion {
    v1 = 'v1',
    v2 = 'v2',
}

export type TRobotId = Opaque<'RobotId', number>;

export type TRobot = TWithBuildInfo & {
    id: TRobotId;
    kind: string;
    name: string;
    status: EComponentStatus;
    statusMessage: null | string;
    orders: TOrder[];
};

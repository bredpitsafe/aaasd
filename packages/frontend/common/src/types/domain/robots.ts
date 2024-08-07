import type { Opaque } from '@common/types';
import type { TBacktestingRunRobotBuildInfo } from '@frontend/backtesting/src/modules/actions/ModuleFetchBacktestingRunsBuildInfo.ts';

import type { EComponentStatus, TOrder } from '../index';
import type { TRobotBuildInfo, TWithRobotBuildInfo } from './buildInfo';

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

export type TRobot = TWithRobotBuildInfo & {
    id: TRobotId;
    kind: string;
    name: string;
    status: EComponentStatus;
    statusMessage: null | string;
    orders: TOrder[];
};

export type TRobotWithNotNilBuildInfo = (TBacktestingRunRobotBuildInfo | TRobot) & {
    buildInfo: TRobotBuildInfo;
};

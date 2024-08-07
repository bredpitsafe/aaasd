import type { TimeZone } from '@common/types';
import type { TTypicalStageRouteParams } from '@frontend/common/src/modules/router/defs';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { THerodotusTaskId } from '@frontend/herodotus/src/types/domain';

export const ETradesRoutes = <const>{
    Trades: `trades`,
};

export type THerodotusTradesRouterData = {
    [ETradesRoutes.Trades]: TTradesRouteParams;
};

export enum ETradesRouteParams {
    TaskId = 'taskId',
    RobotId = 'robotId',
    Name = 'name',
    TimeZone = 'timeZone',
}

export type TTradesRouteParams = TTypicalStageRouteParams & {
    [ETradesRouteParams.Name]: string;
    [ETradesRouteParams.TaskId]: THerodotusTaskId;
    [ETradesRouteParams.RobotId]: TRobotId;
    [ETradesRouteParams.TimeZone]: TimeZone;
};

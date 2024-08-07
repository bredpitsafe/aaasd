import type { Assign, ValueOf } from '@common/types';
import type {
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute, ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import type { IModuleRouter } from '@frontend/common/src/types/router';

export const EBacktestingRoute = <const>{
    ...ETypicalRoute,
    Task: `${ETypicalRoute.Stage}.task`,
    Backtesting: `${ETypicalRoute.Stage}.task.backtesting`,
};

export const EBacktestingSearchParams = <const>{
    ...ETypicalSearchParams,
    BacktestingTaskId: 'backtestingTaskId',
    BacktestingRunId: 'backtestingRunId',
};

type TBacktestingTaskRouteParams = Assign<
    TTypicalStageRouteParams,
    {
        backtestingTaskId: number;
    }
>;

type TBacktestingRouteParams = Assign<
    TBacktestingTaskRouteParams,
    {
        backtestingRunId: number;
    }
>;

type TBacktestingRouterData = TTypicalRouterData & {
    [EBacktestingRoute.Task]: TBacktestingTaskRouteParams;
    [EBacktestingRoute.Backtesting]: TBacktestingRouteParams;
};

export type TAllBacktestingRouteParams = ValueOf<TBacktestingRouterData>;

export type TEncodedBacktestingRouteParams = TEncodedTypicalRouteParams & {
    [EBacktestingSearchParams.BacktestingTaskId]?: string;
    [EBacktestingSearchParams.BacktestingRunId]?: string;
};

export type IModuleBacktestingRouter = IModuleRouter<TBacktestingRouterData>;

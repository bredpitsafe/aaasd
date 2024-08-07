import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import type { Route } from 'router5';

import type { IModuleBacktestingRouter } from '../../defs/router';
import { EBacktestingRoute, EBacktestingSearchParams } from '../../defs/router';
import { decodeParams, encodeParams } from './encoders';

const BacktestingRoutes = [
    {
        name: EBacktestingRoute.Task,
        path: `/:${EBacktestingSearchParams.BacktestingTaskId}${TYPICAL_GET_PARAMS}`,
        encodeParams,
        decodeParams,
    },
    {
        name: EBacktestingRoute.Backtesting,
        path: `/:${EBacktestingSearchParams.BacktestingRunId}${TYPICAL_GET_PARAMS}`,
        encodeParams,
        decodeParams,
    },
] as Route[];

export const ModuleBacktestingRouter = ModuleFactory((ctx) => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(BacktestingRoutes);

    return module as unknown as IModuleBacktestingRouter;
});

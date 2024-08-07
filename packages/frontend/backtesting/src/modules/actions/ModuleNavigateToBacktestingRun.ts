import { ModuleFactory } from '@frontend/common/src/di';
import type {
    TBacktestingRunId,
    TBacktestingTaskId,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';

import { EBacktestingRoute } from '../../defs/router';
import { ModuleBacktestingRouter } from '../router/module';

export const ModuleNavigateToBacktestingRun = ModuleFactory((ctx) => {
    const { navigate } = ModuleBacktestingRouter(ctx);

    return (
        socketName: TSocketName,
        taskId: TBacktestingTaskId,
        backtestingRunId: TBacktestingRunId,
    ) => {
        void navigate(EBacktestingRoute.Backtesting, {
            socket: socketName,
            backtestingTaskId: taskId,
            backtestingRunId,
        });
    };
});

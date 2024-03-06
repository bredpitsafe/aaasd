import type {
    TBacktestingRun,
    TBacktestingTask,
    TBacktestingTaskConfigs,
    TBacktestingTaskId,
} from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';

export const getBacktestingTaskConfigsProcedureDescriptor = createRemoteProcedureDescriptor<
    {
        target: TSocketURL;
        taskId: TBacktestingTaskId;
    },
    TBacktestingTaskConfigs
>()(EActorRemoteProcedureName.GetBacktestingTaskConfigs, ERemoteProcedureType.Request);

export const subscribeToBacktestingTaskProcedureDescriptor = createRemoteProcedureDescriptor<
    {
        target: TSocketURL;
        taskId: TBacktestingTaskId;
    },
    TBacktestingTask
>()(EActorRemoteProcedureName.SubscribeToBacktestingTask, ERemoteProcedureType.Subscribe);

export const subscribeToBacktestingRunProcedureDescriptor = createRemoteProcedureDescriptor<
    {
        target: TSocketURL;
        taskId: TBacktestingTaskId;
    },
    TBacktestingRun[]
>()(EActorRemoteProcedureName.SubscribeToBacktestingRun, ERemoteProcedureType.Subscribe);

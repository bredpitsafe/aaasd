import { toContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure';
import { EActorName } from '../Root/defs';
import { ModuleFetchBacktestingTaskConfigs } from './actions/ModuleFetchBacktestingTaskConfigs';
import { ModuleSubscribeToBacktestingRuns } from './actions/ModuleSubscribeToBacktestingRuns';
import { ModuleSubscribeToBacktestingTask } from './actions/ModuleSubscribeToBacktestingTask';
import {
    getBacktestingTaskConfigsProcedureDescriptor,
    subscribeToBacktestingRunProcedureDescriptor,
    subscribeToBacktestingTaskProcedureDescriptor,
} from './procedureDescriptors';

export function createActorBacktestingDataProviders() {
    return createActor(EActorName.BacktestingDataProvider, (context) => {
        const ctx = toContextRef(context);
        const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);
        const fetchBacktestingTaskConfigs = ModuleFetchBacktestingTaskConfigs(ctx);
        const subscribeTotBacktestingTask = ModuleSubscribeToBacktestingTask(ctx);
        const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);

        registerActorRemoteProcedure(
            getBacktestingTaskConfigsProcedureDescriptor,
            (params, options) => fetchBacktestingTaskConfigs(params, options),
        );

        registerActorRemoteProcedure(
            subscribeToBacktestingTaskProcedureDescriptor,
            (params, options) => subscribeTotBacktestingTask(params.target, params.taskId, options),
        );

        registerActorRemoteProcedure(
            subscribeToBacktestingRunProcedureDescriptor,
            (params, options) => subscribeToBacktestingRuns(params, options),
        );
    });
}

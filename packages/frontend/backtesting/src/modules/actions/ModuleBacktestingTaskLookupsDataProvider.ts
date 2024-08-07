import {
    requestBacktestingTaskItemsProcedureDescriptor,
    subscribeToBacktestingTaskUpdatesProcedureDescriptor,
} from '@frontend/common/src/actors/InfinityHistory/descriptors.ts';
import { ModuleFactory } from '@frontend/common/src/di';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

export const ModuleBacktestingTaskLookupsDataProvider = ModuleFactory((ctx) => {
    // DON'T USE DEDOBS, data depends on time
    const fetch = createRemoteProcedureCall(requestBacktestingTaskItemsProcedureDescriptor)()(ctx);

    const subscribe = createRemoteProcedureCall(
        subscribeToBacktestingTaskUpdatesProcedureDescriptor,
    )()(ctx);

    return { fetch, subscribe };
});

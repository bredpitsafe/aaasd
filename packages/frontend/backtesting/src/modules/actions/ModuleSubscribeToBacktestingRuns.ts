import { subscribeToBacktestingRunProcedureDescriptor } from '@frontend/common/src/actors/BacktestingDataProviders/procedureDescriptors';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';

export const ModuleSubscribeToBacktestingRuns = createRemoteProcedureCall(
    subscribeToBacktestingRunProcedureDescriptor,
)({
    dedobs: {
        normalize: ([params]) => semanticHash.get(params, {}),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

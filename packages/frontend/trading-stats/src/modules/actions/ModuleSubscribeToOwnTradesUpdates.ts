import { subscribeToOwnTradeUpdatesProcedureDescriptor } from '@frontend/common/src/actors/InfinityHistory/descriptors.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

export const ModuleSubscribeToOwnTradesUpdates = createRemoteProcedureCall(
    subscribeToOwnTradeUpdatesProcedureDescriptor,
)();

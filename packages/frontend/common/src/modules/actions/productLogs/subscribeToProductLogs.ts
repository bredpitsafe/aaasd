import { subscribeToProductLogUpdatesProcedureDescriptor } from '../../../actors/InfinityHistory/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleSubscribeToProductLogUpdates = createRemoteProcedureCall(
    subscribeToProductLogUpdatesProcedureDescriptor,
)();

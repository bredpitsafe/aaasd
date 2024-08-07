import { subscribeToOrdersUpdatesProcedureDescriptor } from '../../../actors/TradingServersManager/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleSubscribeToOrdersUpdates = createRemoteProcedureCall(
    subscribeToOrdersUpdatesProcedureDescriptor,
)();

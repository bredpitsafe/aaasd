import { requestProductLogItemsProcedureDescriptor } from '../../../actors/InfinityHistory/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchProductLogs = createRemoteProcedureCall(
    requestProductLogItemsProcedureDescriptor,
)();

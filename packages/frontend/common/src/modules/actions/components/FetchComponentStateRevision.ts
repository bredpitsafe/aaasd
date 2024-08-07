import { FetchComponentStateRevisionProcedureDescriptor } from '../../../actors/TradingServersManager/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchComponentStateRevision = createRemoteProcedureCall(
    FetchComponentStateRevisionProcedureDescriptor,
)();

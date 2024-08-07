import { fetchOrdersSnapshotProcedureDescriptor } from '../../../actors/TradingServersManager/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchOrdersSnapshot = createRemoteProcedureCall(
    fetchOrdersSnapshotProcedureDescriptor,
)();

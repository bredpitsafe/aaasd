import { fetchGateKindsProcedureDescriptor } from '../../../actors/TradingServersManager/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchGateKinds = createRemoteProcedureCall(fetchGateKindsProcedureDescriptor)();

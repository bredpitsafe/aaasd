import { reloadAllTabsProcedureDescriptor } from '../../actors/procedureDescriptors';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';

export const ModuleReloadAllTabs = createRemoteProcedureCall(reloadAllTabsProcedureDescriptor)();

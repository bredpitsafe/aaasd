import { fetchAssetsProcedureDescriptors } from '../../../actors/Dictionaries/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchAssets = createRemoteProcedureCall(fetchAssetsProcedureDescriptors)();

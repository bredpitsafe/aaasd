import { fetchInstrumentsProcedureDescriptors } from '../../../actors/Dictionaries/descriptors.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleFetchInstruments = createRemoteProcedureCall(
    fetchInstrumentsProcedureDescriptors,
)();

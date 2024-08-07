import { updateComponentStateProcedureDescriptor } from '@common/rpc';

import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleCreateComponentStateRevision = createRemoteProcedureCall(
    updateComponentStateProcedureDescriptor,
)();

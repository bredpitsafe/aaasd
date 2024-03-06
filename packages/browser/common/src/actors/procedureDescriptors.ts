import { createRemoteProcedureDescriptor } from '../utils/RPC/createRemoteProcedureDescriptor';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../utils/RPC/defs';

export const reloadAllTabsProcedureDescriptor = createRemoteProcedureDescriptor<undefined, never>()(
    EActorRemoteProcedureName.ReloadAllTabs,
    ERemoteProcedureType.Update,
);

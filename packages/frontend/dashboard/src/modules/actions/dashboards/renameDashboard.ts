import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

import { renameDashboardProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';

export const ModuleRenameDashboard = createRemoteProcedureCall(
    renameDashboardProcedureDescriptor,
)();

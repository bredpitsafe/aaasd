import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

import { updateDashboardScopeBindingProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';

export const ModuleUpdateDashboardBinding = createRemoteProcedureCall(
    updateDashboardScopeBindingProcedureDescriptor,
)();

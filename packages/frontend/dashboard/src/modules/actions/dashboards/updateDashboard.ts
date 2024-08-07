import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

import { updateDashboardDraftProcedureDescriptor } from '../../../actors/FullDashboards/descriptors';

export const ModuleUpdateDashboard = createRemoteProcedureCall(
    updateDashboardDraftProcedureDescriptor,
)();

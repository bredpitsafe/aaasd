import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { deleteDashboardProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';

export const ModuleDeleteDashboard = createRemoteProcedureCall(deleteDashboardProcedureDescriptor)({
    getPipe: () => mapValueDescriptor(() => createSyncedValueDescriptor(true)),
});

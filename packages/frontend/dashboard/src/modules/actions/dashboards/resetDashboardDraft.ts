import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { pipe } from 'rxjs';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import { resetDashboardDraftProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';

export const ModuleResetDashboardDraft = createRemoteProcedureCall(
    resetDashboardDraftProcedureDescriptor,
)({
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(() => createSyncedValueDescriptor(true)),
        ),
});

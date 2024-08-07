import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';

import { SubscribeToDashboardUpdateProgressProcedureDescriptor } from '../../../actors/FullDashboards/descriptors.ts';

export const ModuleSubscribeToDashboardsUpdateProgress = createRemoteProcedureCall(
    SubscribeToDashboardUpdateProgressProcedureDescriptor,
)({
    dedobs: {
        normalize: constantNormalizer,
        resetDelay: 0,
        removeDelay: 0,
    },
});

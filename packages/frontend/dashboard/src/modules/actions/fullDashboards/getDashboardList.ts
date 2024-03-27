import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';

import { getDashboardsListProcedureDescriptor } from '../../../actors/FullDashboards/descriptors';

export const ModuleGetDashboardList = createRemoteProcedureCall(
    getDashboardsListProcedureDescriptor,
)({
    dedobs: {
        normalize: constantNormalizer,
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

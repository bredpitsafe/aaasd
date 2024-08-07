import type {
    TResetDashboardDraftConfigRequest,
    TResetDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const resetDashboardDraftConfigTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.ResetDashboardDraftConfig,
    TResetDashboardDraftConfigRequest,
    TResetDashboardDraftConfigResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse() {
        return {
            type: 'DashboardDraftConfigReset',
        };
    },
};

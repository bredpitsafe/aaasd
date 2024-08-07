import type {
    TUpdateDashboardDraftConfigRequest,
    TUpdateDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const updateDashboardDraftConfigTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.UpdateDashboardDraftConfig,
    TUpdateDashboardDraftConfigRequest,
    TUpdateDashboardDraftConfigResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse() {
        return {
            type: 'DashboardDraftConfigUpdated',
        };
    },
};

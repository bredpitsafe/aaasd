import type {
    TUpdateDashboardShareSettingsRequest,
    TUpdateDashboardShareSettingsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const updateDashboardShareSettingsTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.UpdateDashboardShareSettings,
    TUpdateDashboardShareSettingsRequest,
    TUpdateDashboardShareSettingsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse() {
        return {
            type: 'DashboardShareSettingsUpdated',
        };
    },
};

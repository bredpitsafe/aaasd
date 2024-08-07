import type {
    TDeleteDashboardRequest,
    TDeleteDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const deleteDashboardTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.DeleteDashboard,
    TDeleteDashboardRequest,
    TDeleteDashboardResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse() {
        return {
            type: 'DashboardDeleted',
        };
    },
};

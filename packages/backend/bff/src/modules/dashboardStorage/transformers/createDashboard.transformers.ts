import type {
    TCreateDashboardRequest,
    TCreateDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const createDashboardTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.CreateDashboard,
    TCreateDashboardRequest,
    TCreateDashboardResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'DashboardCreated',
            id: res.id,
        };
    },
};

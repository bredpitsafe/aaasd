import type {
    TSubscribeToDashboardRequest,
    TSubscribeToDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const subscribeToDashboardTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.SubscribeToDashboard,
    TSubscribeToDashboardRequest,
    TSubscribeToDashboardResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'Dashboard',
            dashboard: res.dashboard,
        };
    },
};

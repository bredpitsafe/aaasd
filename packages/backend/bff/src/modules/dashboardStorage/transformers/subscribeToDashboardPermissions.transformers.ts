import type {
    TSubscribeToDashboardPermissionsRequest,
    TSubscribeToDashboardPermissionsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const subscribeToDashboardPermissionsTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.SubscribeToDashboardPermissions,
    TSubscribeToDashboardPermissionsRequest,
    TSubscribeToDashboardPermissionsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'DashboardPermissionsList',
            list: res.list,
        };
    },
};

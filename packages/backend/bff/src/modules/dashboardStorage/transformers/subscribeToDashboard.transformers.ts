import type {
    TSubscribeToDashboardListRequest,
    TSubscribeToDashboardListResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const subscribeToDashboardListTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.SubscribeToDashboardList,
    TSubscribeToDashboardListRequest,
    TSubscribeToDashboardListResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'DashboardList',
            list: res.list,
        };
    },
};

import type {
    TFetchDashboardConfigRequest,
    TFetchDashboardConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const fetchDashboardConfigTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.FetchDashboardConfig,
    TFetchDashboardConfigRequest,
    TFetchDashboardConfigResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'DashboardConfig',
            ...res,
        };
    },
};

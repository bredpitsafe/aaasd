import type {
    TImportDashboardRequest,
    TImportDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const importDashboardTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.ImportDashboard,
    TImportDashboardRequest,
    TImportDashboardResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'DashboardImported',
            id: res.id,
        };
    },
};

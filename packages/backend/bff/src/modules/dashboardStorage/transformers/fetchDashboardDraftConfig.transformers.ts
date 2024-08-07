import type {
    TFetchDashboardDraftConfigRequest,
    TFetchDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const fetchDashboardDraftConfigTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.FetchDashboardDraftConfig,
    TFetchDashboardDraftConfigRequest,
    TFetchDashboardDraftConfigResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'DashboardDraftConfig',
            ...res,
        };
    },
};

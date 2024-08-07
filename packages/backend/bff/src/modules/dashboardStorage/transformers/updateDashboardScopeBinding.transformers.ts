import type {
    TUpdateDashboardScopeBindingRequest,
    TUpdateDashboardScopeBindingResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/scope_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EDashboardStorageRouteName } from '../def.ts';

export const updateDashboardScopeBindingTransformers: TRpcRouteTransformers<
    EDashboardStorageRouteName.UpdateDashboardScopeBinding,
    TUpdateDashboardScopeBindingRequest,
    TUpdateDashboardScopeBindingResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse() {
        return {
            type: 'DashboardScopeBindingUpdated',
        };
    },
};

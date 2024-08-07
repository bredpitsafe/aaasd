import type {
    TSubscribeToPermissionsRequest,
    TSubscribeToPermissionsResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/permission_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const subscribeToPermissionsTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.SubscribeToPermissions,
    TSubscribeToPermissionsRequest,
    TSubscribeToPermissionsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'Updates', ...res };
    },
};

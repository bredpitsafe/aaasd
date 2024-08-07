import type {
    TGrantPolicyRequest,
    TGrantPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const grantPolicyTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.GrantPolicy,
    TGrantPolicyRequest,
    TGrantPolicyResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'PolicyGranted', ...res };
    },
};

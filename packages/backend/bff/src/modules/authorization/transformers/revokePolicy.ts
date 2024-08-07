import type {
    TRevokePolicyRequest,
    TRevokePolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const revokePolicyTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.RevokePolicy,
    TRevokePolicyRequest,
    TRevokePolicyResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'PolicyRevoked', ...res };
    },
};

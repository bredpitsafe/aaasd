import type {
    TRemovePolicyRequest,
    TRemovePolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const removePolicyTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.RemovePolicy,
    TRemovePolicyRequest,
    TRemovePolicyResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'PolicyRemoved', ...res };
    },
};

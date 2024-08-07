import type {
    TRenderPolicyRequest,
    TRenderPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const renderPolicyTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.RenderPolicy,
    TRenderPolicyRequest,
    TRenderPolicyResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'PolicyRendered', ...res };
    },
};

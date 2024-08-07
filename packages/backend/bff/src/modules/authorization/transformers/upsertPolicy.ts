import type {
    TUpsertPolicyRequest,
    TUpsertPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const upsertPolicyTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.UpsertPolicy,
    TUpsertPolicyRequest,
    TUpsertPolicyResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'PolicyUpserted', ...res };
    },
};

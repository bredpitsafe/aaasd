import type {
    TSubscribeToPolicySnapshotRequest,
    TSubscribeToPolicySnapshotResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const subscribeToPolicySnapshotTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.SubscribeToPolicySnapshot,
    TSubscribeToPolicySnapshotRequest,
    TSubscribeToPolicySnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

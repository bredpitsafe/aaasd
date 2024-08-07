import type {
    TSubscribeToGroupSnapshotRequest,
    TSubscribeToGroupSnapshotResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/group_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const subscribeToGroupSnapshotTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.SubscribeToGroupSnapshot,
    TSubscribeToGroupSnapshotRequest,
    TSubscribeToGroupSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

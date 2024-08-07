import type {
    TSubscribeToUserSnapshotRequest,
    TSubscribeToUserSnapshotResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/user_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const subscribeToUserSnapshotTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.SubscribeToUserSnapshot,
    TSubscribeToUserSnapshotRequest,
    TSubscribeToUserSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

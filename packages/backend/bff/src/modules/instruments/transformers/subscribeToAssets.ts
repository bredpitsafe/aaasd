import type {
    TSubscribeToAssetsRequest,
    TSubscribeToAssetsResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const subscribeToAssetsTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.SubscribeToAssets,
    TSubscribeToAssetsRequest,
    TSubscribeToAssetsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

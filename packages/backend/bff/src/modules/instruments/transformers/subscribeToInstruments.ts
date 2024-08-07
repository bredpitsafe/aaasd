import type {
    TSubscribeToInstrumentsRequest,
    TSubscribeToInstrumentsResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const subscribeToInstrumentsTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.SubscribeToInstruments,
    TSubscribeToInstrumentsRequest,
    TSubscribeToInstrumentsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

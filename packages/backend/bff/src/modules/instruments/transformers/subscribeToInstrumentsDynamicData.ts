import type {
    TSubscribeToInstrumentsDynamicDataRequest,
    TSubscribeToInstrumentsDynamicDataResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRpcSubscriptionEventToResponse } from '../../../utils/subscription.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const subscribeToInstrumentsDynamicDataTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.SubscribeToInstrumentsDynamicData,
    TSubscribeToInstrumentsDynamicDataRequest,
    TSubscribeToInstrumentsDynamicDataResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return mapRpcSubscriptionEventToResponse(res.response);
    },
};

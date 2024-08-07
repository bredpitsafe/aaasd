import { assertFail } from '@common/utils';
import type {
    TSubscribeToInstrumentRevisionsRequest,
    TSubscribeToInstrumentRevisionsResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import { ERpcSubscriptionEvent } from '../../../def/rpc.ts';
import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const subscribeToInstrumentRevisionsTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.SubscribeToInstrumentRevisions,
    TSubscribeToInstrumentRevisionsRequest,
    TSubscribeToInstrumentRevisionsResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        switch (res.response?.type) {
            case 'ok': {
                return {
                    type: ERpcSubscriptionEvent.Ok,
                    platformTime: res.response.ok.platformTime,
                };
            }
            case 'updates': {
                return {
                    type: ERpcSubscriptionEvent.Updates,
                    upserted: mapRequired(res.response.updates.upserted),
                };
            }
            default: {
                assertFail(res.response);
            }
        }
    },
};

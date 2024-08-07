import type {
    TFetchInstrumentRevisionsLogRequest,
    TFetchInstrumentRevisionsLogResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const fetchInstrumentRevisionsLogTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.FetchInstrumentRevisionsLog,
    TFetchInstrumentRevisionsLogRequest,
    TFetchInstrumentRevisionsLogResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'Snapshot',
            snapshot: mapRequired(res.entities),
        };
    },
};

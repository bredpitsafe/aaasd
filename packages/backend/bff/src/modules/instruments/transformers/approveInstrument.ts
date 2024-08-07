import type {
    TApproveInstrumentRequest,
    TApproveInstrumentResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const approveInstrumentTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.ApproveInstrument,
    TApproveInstrumentRequest,
    TApproveInstrumentResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { ...res, type: 'InstrumentApproved' };
    },
};

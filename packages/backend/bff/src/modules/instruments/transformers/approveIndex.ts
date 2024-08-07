import type {
    TApproveIndexRequest,
    TApproveIndexResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/index_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const approveIndexTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.ApproveIndex,
    TApproveIndexRequest,
    TApproveIndexResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { ...res, type: 'IndexApproved' };
    },
};

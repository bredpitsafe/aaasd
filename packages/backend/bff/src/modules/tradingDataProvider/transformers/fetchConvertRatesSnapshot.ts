import type {
    TFetchConvertRatesSnapshotRequest,
    TFetchConvertRatesSnapshotResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';

export const fetchConvertRatesSnapshotTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchConvertRatesSnapshot,
    TFetchConvertRatesSnapshotRequest,
    TFetchConvertRatesSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'ConvertRatesSnapshot',
            snapshot: mapRequired(res.snapshot),
        };
    },
};

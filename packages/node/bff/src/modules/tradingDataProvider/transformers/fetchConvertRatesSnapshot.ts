import type {
    FetchConvertRatesSnapshotRequest,
    FetchConvertRatesSnapshotResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import { ETradingDataProviderRouteName } from '../def.ts';

export const fetchConvertRatesSnapshotTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchConvertRatesSnapshot,
    FetchConvertRatesSnapshotRequest,
    FetchConvertRatesSnapshotResponse
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

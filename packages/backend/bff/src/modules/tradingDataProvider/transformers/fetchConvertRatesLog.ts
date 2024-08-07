import type {
    TFetchConvertRatesLogRequest,
    TFetchConvertRatesLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';

export const fetchConvertRatesLogTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchConvertRatesLog,
    TFetchConvertRatesLogRequest,
    TFetchConvertRatesLogResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'ConvertRatesLog',
            log: res.log,
        };
    },
};

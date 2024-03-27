import type {
    FetchConvertRatesLogRequest,
    FetchConvertRatesLogResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { mapRequired } from '../../../utils/mapRequired.ts';
import { ETradingDataProviderRouteName } from '../def.ts';

export const fetchConvertRatesLogTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchConvertRatesLog,
    FetchConvertRatesLogRequest,
    FetchConvertRatesLogResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },

    fromGrpcToResponse(res) {
        return {
            type: 'ConvertRatesLog',
            log: mapRequired(res.log),
        };
    },
};

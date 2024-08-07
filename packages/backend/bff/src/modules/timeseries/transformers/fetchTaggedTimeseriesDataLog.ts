import type {
    TFetchTaggedTimeseriesDataLogRequest,
    TFetchTaggedTimeseriesDataLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETimeseriesRouteName } from '../def.ts';

export const fetchTaggedTimeseriesDataLogTransformers: TRpcRouteTransformers<
    ETimeseriesRouteName.FetchTaggedTimeseriesDataLog,
    TFetchTaggedTimeseriesDataLogRequest,
    TFetchTaggedTimeseriesDataLogResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'Snapshot',
            ...res,
        };
    },
};

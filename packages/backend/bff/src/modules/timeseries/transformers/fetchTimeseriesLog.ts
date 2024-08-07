import type {
    TFetchTimeseriesLogRequest,
    TFetchTimeseriesLogResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/timeseries_api.d.ts';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETimeseriesRouteName } from '../def.ts';

export const fetchTimeseriesLogTransformers: TRpcRouteTransformers<
    ETimeseriesRouteName.FetchTimeseriesLog,
    TFetchTimeseriesLogRequest,
    TFetchTimeseriesLogResponse
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

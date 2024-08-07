import type {
    TFetchStmBalancesSnapshotRequest,
    TFetchStmBalancesSnapshotResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToBalancesArray } from './utils/convertStmBalancesToBalancesArray.ts';

export const fetchStmBalancesSnapshotTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchStmBalancesSnapshot,
    TFetchStmBalancesSnapshotRequest,
    TFetchStmBalancesSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'StmBalancesSnapshot',
            snapshot: convertStmBalancesToBalancesArray(res.snapshot),
        };
    },
};

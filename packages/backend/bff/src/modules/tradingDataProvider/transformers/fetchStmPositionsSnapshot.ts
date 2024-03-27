import {
    FetchStmBalancesSnapshotRequest,
    FetchStmBalancesSnapshotResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToPositionsArray } from './utils/convertStmBalancesToPositionsArray.ts';

export const fetchStmPositionsSnapshotTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchStmPositionsSnapshot,
    FetchStmBalancesSnapshotRequest,
    FetchStmBalancesSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return {
            type: 'StmPositionsSnapshot',
            snapshot: convertStmBalancesToPositionsArray(res.snapshot),
        };
    },
};

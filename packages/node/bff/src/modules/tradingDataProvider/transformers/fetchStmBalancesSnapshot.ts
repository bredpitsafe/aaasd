import {
    FetchStmBalancesSnapshotRequest,
    FetchStmBalancesSnapshotResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToBalancesArray } from './utils/convertStmBalancesToBalancesArray.ts';

export const fetchStmBalancesSnapshotTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.FetchStmBalancesSnapshot,
    FetchStmBalancesSnapshotRequest,
    FetchStmBalancesSnapshotResponse
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

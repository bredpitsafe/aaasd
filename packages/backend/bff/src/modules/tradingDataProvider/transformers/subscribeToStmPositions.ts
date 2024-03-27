import {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { assertNever } from '../../../utils/types.ts';
import { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToPositionsArray } from './utils/convertStmBalancesToPositionsArray.ts';

export const subscribeToStmPositionsTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToStmPositions,
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse
> = {
    fromRequestToGrpc(req) {
        return {
            filters: req.payload?.filters,
        };
    },
    fromGrpcToResponse(res) {
        switch (res.response?.$case) {
            case 'subscribed': {
                return {
                    type: 'StmPositionsSubscribed',
                };
            }
            case 'updated': {
                return {
                    type: 'StmPositionsUpdated',
                    updated: convertStmBalancesToPositionsArray(res.response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'StmPositionsRemoved',
                    removed: res.response.removed.keys,
                };
            }
            default: {
                assertNever(res.response as never);
            }
        }
    },
};

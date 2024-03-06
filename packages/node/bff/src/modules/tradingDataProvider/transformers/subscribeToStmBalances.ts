import {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import { TRpcRouteTransformers } from '../../../rpc/def.ts';
import { assertNever } from '../../../utils/types.ts';
import { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToBalancesArray } from './utils/convertStmBalancesToBalancesArray.ts';

export const subscribeToStmBalancesTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToStmBalances,
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        switch (res.response?.$case) {
            case 'subscribed': {
                return {
                    type: 'StmBalancesSubscribed',
                };
            }
            case 'updated': {
                return {
                    type: 'StmBalancesUpdated',
                    updated: convertStmBalancesToBalancesArray(res.response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'StmBalancesRemoved',
                    removed: res.response.removed.keys,
                };
            }
            default: {
                assertNever(res.response as never);
            }
        }
    },
};

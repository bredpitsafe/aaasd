import { assert, assertNever } from '@common/utils';
import type {
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { isNil } from 'lodash-es';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToBalancesArray } from './utils/convertStmBalancesToBalancesArray.ts';

export const subscribeToStmBalancesTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToStmBalances,
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse({ response }) {
        assert(!isNil(response), `Response can't be empty`);

        switch (response.type) {
            case 'subscribed': {
                return {
                    type: 'StmBalancesSubscribed',
                };
            }
            case 'updated': {
                return {
                    type: 'StmBalancesUpdated',
                    updated: convertStmBalancesToBalancesArray(response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'StmBalancesRemoved',
                    removed: response.removed.keys,
                };
            }
            default: {
                assertNever(response);
            }
        }
    },
};

import { assert, assertNever } from '@common/utils';
import type {
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponse,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { isNil } from 'lodash-es';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { ETradingDataProviderRouteName } from '../def.ts';
import { convertStmBalancesToPositionsArray } from './utils/convertStmBalancesToPositionsArray.ts';

export const subscribeToStmPositionsTransformers: TRpcRouteTransformers<
    ETradingDataProviderRouteName.SubscribeToStmPositions,
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponse
> = {
    fromRequestToGrpc(req) {
        return {
            filters: req.payload?.filters,
        };
    },
    fromGrpcToResponse({ response }) {
        assert(!isNil(response), `Response can't be empty`);

        switch (response.type) {
            case 'subscribed': {
                return {
                    type: 'StmPositionsSubscribed',
                };
            }
            case 'updated': {
                return {
                    type: 'StmPositionsUpdated',
                    updated: convertStmBalancesToPositionsArray(response.updated.updates),
                };
            }
            case 'removed': {
                return {
                    type: 'StmPositionsRemoved',
                    removed: response.removed.keys,
                };
            }
            default: {
                assertNever(response);
            }
        }
    },
};

import type {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse_Removed,
    SubscribeToStmBalancesResponse_Subscribed,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import {
    StmBalance,
    StmBalance_AssetAmount,
} from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';

import { WithRequestStage } from '../../../def/stages.ts';
import type { Assign } from '../../../def/types.ts';

export type TStmBalance = Omit<StmBalance, 'positions'> & StmBalance_AssetAmount;

export type TSubscribeToStmBalancesRequestPayload = WithRequestStage<
    Assign<
        SubscribeToStmBalancesRequest,
        {
            type: 'SubscribeToStmBalances';
        }
    >
>;

export type TSubscribeToStmBalancesResponsePayload =
    | ({ type: 'StmBalancesSubscribed' } & SubscribeToStmBalancesResponse_Subscribed)
    | ({ type: 'StmBalancesUpdated' } & { updated: TStmBalance[] })
    | ({
          type: 'StmBalancesRemoved';
      } & { removed: SubscribeToStmBalancesResponse_Removed['keys'] });

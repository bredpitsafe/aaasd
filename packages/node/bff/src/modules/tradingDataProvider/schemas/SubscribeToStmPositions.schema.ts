import type {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse_Removed,
    SubscribeToStmBalancesResponse_Subscribed,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';

import { WithRequestStage } from '../../../def/stages.ts';
import type { Assign } from '../../../def/types.ts';

export type TStmPosition = Omit<StmBalance, 'balances'>;

export type TSubscribeToStmPositionsRequestPayload = WithRequestStage<
    Assign<
        SubscribeToStmBalancesRequest,
        {
            type: 'SubscribeToStmPositions';
        }
    >
>;

export type TSubscribeToStmPositionsResponsePayload =
    | ({ type: 'StmPositionsSubscribed' } & SubscribeToStmBalancesResponse_Subscribed)
    | ({ type: 'StmPositionsUpdated' } & { updated: TStmPosition[] })
    | ({
          type: 'StmPositionsRemoved';
      } & { removed: SubscribeToStmBalancesResponse_Removed['keys'] });

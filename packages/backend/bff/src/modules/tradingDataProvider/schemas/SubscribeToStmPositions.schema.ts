import type { Assign, InterfaceToType } from '@backend/utils/src/util-types.ts';
import type {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse_Removed,
    SubscribeToStmBalancesResponse_Subscribed,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';

import type { WithRequestStage } from '../../../def/stages.ts';

export type TStmPosition = Omit<StmBalance, 'balances'>;

export type TSubscribeToStmPositionsRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            SubscribeToStmBalancesRequest,
            {
                type: 'SubscribeToStmPositions';
            }
        >
    >
>;

/** @public */
export type TSubscribeToStmPositionsResponseSubscribedPayload = {
    type: 'StmPositionsSubscribed';
} & InterfaceToType<SubscribeToStmBalancesResponse_Subscribed>;

export type TSubscribeToStmPositionsResponseUpdatedPayload = {
    type: 'StmPositionsUpdated';
    updated: TStmPosition[];
};

export type TSubscribeToStmPositionsResponseRemovedPayload = {
    type: 'StmPositionsRemoved';
} & InterfaceToType<{ removed: SubscribeToStmBalancesResponse_Removed['keys'] }>;

export type TSubscribeToStmPositionsResponsePayload =
    | TSubscribeToStmPositionsResponseSubscribedPayload
    | TSubscribeToStmPositionsResponseUpdatedPayload
    | TSubscribeToStmPositionsResponseRemovedPayload;

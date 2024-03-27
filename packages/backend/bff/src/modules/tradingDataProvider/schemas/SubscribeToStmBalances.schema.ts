import type { Assign, InterfaceToType } from '@backend/utils/src/util-types.ts';
import type {
    SubscribeToStmBalancesRequest,
    SubscribeToStmBalancesResponse_Removed,
    SubscribeToStmBalancesResponse_Subscribed,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';

import type { WithRequestStage } from '../../../def/stages.ts';

export type TStmBalance = InterfaceToType<Omit<StmBalance, 'position'>>;

export type TSubscribeToStmBalancesRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            SubscribeToStmBalancesRequest,
            {
                type: 'SubscribeToStmBalances';
            }
        >
    >
>;

/** @public */
export type TSubscribeToStmBalancesResponseSubscribedPayload = {
    type: 'StmBalancesSubscribed';
} & InterfaceToType<SubscribeToStmBalancesResponse_Subscribed>;

export type TSubscribeToStmBalancesResponseUpdatedPayload = {
    type: 'StmBalancesUpdated';
} & InterfaceToType<{ updated: TStmBalance[] }>;

export type TSubscribeToStmBalancesResponseRemovedPayload = {
    type: 'StmBalancesRemoved';
} & InterfaceToType<{ removed: SubscribeToStmBalancesResponse_Removed['keys'] }>;

export type TSubscribeToStmBalancesResponsePayload =
    | TSubscribeToStmBalancesResponseSubscribedPayload
    | TSubscribeToStmBalancesResponseUpdatedPayload
    | TSubscribeToStmBalancesResponseRemovedPayload;

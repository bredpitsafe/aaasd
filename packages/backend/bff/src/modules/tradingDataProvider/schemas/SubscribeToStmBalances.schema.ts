import type { Assign } from '@common/types';
import type {
    TStmBalance as TStmBalanceSDK,
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponseRemoved,
    TSubscribeToStmBalancesResponseSubscribed,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

export type TStmBalance = Omit<TStmBalanceSDK, 'position'>;

export type TSubscribeToStmBalancesRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TSubscribeToStmBalancesRequest,
            {
                type: 'SubscribeToStmBalances';
            }
        >
    >
>;

/** @public */
export type TSubscribeToStmBalancesResponseSubscribedPayload = {
    type: 'StmBalancesSubscribed';
} & TSubscribeToStmBalancesResponseSubscribed;

/** @public */
export type TSubscribeToStmBalancesResponseUpdatedPayload = {
    type: 'StmBalancesUpdated';
} & { updated: TStmBalance[] };

/** @public */
export type TSubscribeToStmBalancesResponseRemovedPayload = {
    type: 'StmBalancesRemoved';
} & { removed: TSubscribeToStmBalancesResponseRemoved['keys'] };

export type TSubscribeToStmBalancesResponsePayload =
    | TSubscribeToStmBalancesResponseSubscribedPayload
    | TSubscribeToStmBalancesResponseUpdatedPayload
    | TSubscribeToStmBalancesResponseRemovedPayload;

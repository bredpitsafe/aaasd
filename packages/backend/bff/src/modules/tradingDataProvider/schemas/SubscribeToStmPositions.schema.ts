import type { Assign } from '@common/types';
import type {
    TStmBalance,
    TSubscribeToStmBalancesRequest,
    TSubscribeToStmBalancesResponseRemoved,
    TSubscribeToStmBalancesResponseSubscribed,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
/** @public */
export type { TStmKey } from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';

export type TStmPosition = Omit<TStmBalance, 'balances'>;

export type TSubscribeToStmPositionsRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TSubscribeToStmBalancesRequest,
            {
                type: 'SubscribeToStmPositions';
            }
        >
    >
>;

/** @public */
export type TSubscribeToStmPositionsResponseSubscribedPayload = {
    type: 'StmPositionsSubscribed';
} & TSubscribeToStmBalancesResponseSubscribed;

/** @public */
export type TSubscribeToStmPositionsResponseUpdatedPayload = {
    type: 'StmPositionsUpdated';
    updated: TStmPosition[];
};

/** @public */
export type TSubscribeToStmPositionsResponseRemovedPayload = {
    type: 'StmPositionsRemoved';
} & { removed: TSubscribeToStmBalancesResponseRemoved['keys'] };

export type TSubscribeToStmPositionsResponsePayload =
    | TSubscribeToStmPositionsResponseSubscribedPayload
    | TSubscribeToStmPositionsResponseUpdatedPayload
    | TSubscribeToStmPositionsResponseRemovedPayload;

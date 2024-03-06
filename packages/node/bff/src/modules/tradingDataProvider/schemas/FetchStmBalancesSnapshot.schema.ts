import type { FetchStmBalancesSnapshotRequest } from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import { WithRequestStage } from '../../../def/stages.ts';
import type { Assign } from '../../../def/types.ts';
import { TStmBalance } from './SubscribeToStmBalances.schema.ts';

export type TFetchStmBalancesSnapshotRequestPayload = WithRequestStage<
    Assign<
        FetchStmBalancesSnapshotRequest,
        {
            type: 'FetchStmBalancesSnapshot';
        }
    >
>;

export type TFetchStmBalancesSnapshotResponsePayload = {
    type: 'StmBalancesSnapshot';
    snapshot: TStmBalance[];
};

import type { FetchStmBalancesSnapshotRequest } from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import { WithRequestStage } from '../../../def/stages.ts';
import type { Assign } from '../../../def/types.ts';
import { TStmPosition } from './SubscribeToStmPositions.schema.ts';

export type TFetchStmPositionsSnapshotRequestPayload = WithRequestStage<
    Assign<
        FetchStmBalancesSnapshotRequest,
        {
            type: 'FetchStmPositionsSnapshot';
        }
    >
>;

export type TFetchStmPositionsSnapshotResponsePayload = {
    type: 'StmPositionsSnapshot';
    snapshot: TStmPosition[];
};

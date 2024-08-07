import type { Assign } from '@common/types';
import type { TFetchStmBalancesSnapshotRequest } from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';
import type { TStmPosition } from './SubscribeToStmPositions.schema.ts';

export type TFetchStmPositionsSnapshotRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchStmBalancesSnapshotRequest,
            {
                type: 'FetchStmPositionsSnapshot';
            }
        >
    >
>;

export type TFetchStmPositionsSnapshotResponsePayload = {
    type: 'StmPositionsSnapshot';
    snapshot: TStmPosition[];
};

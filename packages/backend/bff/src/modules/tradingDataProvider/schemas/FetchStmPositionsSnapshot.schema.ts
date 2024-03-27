import type { Assign, InterfaceToType } from '@backend/utils/src/util-types.ts';
import type { FetchStmBalancesSnapshotRequest } from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithRequestStage } from '../../../def/stages.ts';
import type { TStmPosition } from './SubscribeToStmPositions.schema.ts';

export type TFetchStmPositionsSnapshotRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            FetchStmBalancesSnapshotRequest,
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

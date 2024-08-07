import type { Assign } from '@common/types';
import type { TFetchStmBalancesSnapshotRequest } from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithMock } from '../../../def/mock.ts';
import type { WithRequestStage } from '../../../def/stages.ts';
import type { TStmBalance } from './SubscribeToStmBalances.schema.ts';

export type TFetchStmBalancesSnapshotRequestPayload = WithMock<
    WithRequestStage<
        Assign<
            TFetchStmBalancesSnapshotRequest,
            {
                type: 'FetchStmBalancesSnapshot';
            }
        >
    >
>;

export type TFetchStmBalancesSnapshotResponsePayload = {
    type: 'StmBalancesSnapshot';
} & { snapshot: TStmBalance[] };

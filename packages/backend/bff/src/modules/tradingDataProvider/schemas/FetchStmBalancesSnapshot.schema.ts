import type { Assign, InterfaceToType } from '@backend/utils/src/util-types.ts';
import type { FetchStmBalancesSnapshotRequest } from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';

import type { WithRequestStage } from '../../../def/stages.ts';
import type { TStmBalance } from './SubscribeToStmBalances.schema.ts';

export type TFetchStmBalancesSnapshotRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            FetchStmBalancesSnapshotRequest,
            {
                type: 'FetchStmBalancesSnapshot';
            }
        >
    >
>;

export type TFetchStmBalancesSnapshotResponsePayload = {
    type: 'StmBalancesSnapshot';
} & InterfaceToType<{ snapshot: TStmBalance[] }>;

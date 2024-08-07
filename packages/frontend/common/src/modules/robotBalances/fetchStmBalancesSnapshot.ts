import type {
    TFetchStmBalancesSnapshotRequestPayload,
    TFetchStmBalancesSnapshotResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmBalancesSnapshot.schema';
import type { TStmBalance } from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';

export const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchStmBalancesSnapshotRequestPayload,
    TFetchStmBalancesSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchStmBalancesSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchStmBalancesSnapshot = createRemoteProcedureCall(fetchDescriptor)({
    getPipe: () =>
        mapValueDescriptor(
            ({
                value: {
                    payload: { snapshot },
                },
            }): TValueDescriptor2<TStmBalance[]> => createSyncedValueDescriptor(snapshot),
        ),
});

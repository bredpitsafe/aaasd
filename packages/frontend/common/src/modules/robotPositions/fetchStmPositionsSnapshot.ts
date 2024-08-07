import type {
    TFetchStmPositionsSnapshotRequestPayload,
    TFetchStmPositionsSnapshotResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmPositionsSnapshot.schema';
import type { TStmPosition } from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';

export const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchStmPositionsSnapshotRequestPayload,
    TFetchStmPositionsSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchStmPositionsSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchStmPositionsSnapshot = createRemoteProcedureCall(fetchDescriptor)({
    getPipe: () =>
        mapValueDescriptor(
            ({
                value: {
                    payload: { snapshot },
                },
            }): TValueDescriptor2<TStmPosition[]> => createSyncedValueDescriptor(snapshot),
        ),
});

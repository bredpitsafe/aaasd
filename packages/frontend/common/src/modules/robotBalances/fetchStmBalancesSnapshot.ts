import type {
    TFetchStmBalancesSnapshotRequestPayload,
    TFetchStmBalancesSnapshotResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmBalancesSnapshot.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchStmBalancesSnapshotRequestPayload,
    TFetchStmBalancesSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchStmBalancesSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchStmBalancesSnapshot = createRemoteProcedureCall(fetchDescriptor)();

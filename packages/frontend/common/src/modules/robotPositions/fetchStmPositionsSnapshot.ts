import type {
    TFetchStmPositionsSnapshotRequestPayload,
    TFetchStmPositionsSnapshotResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmPositionsSnapshot.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchStmPositionsSnapshotRequestPayload,
    TFetchStmPositionsSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchStmPositionsSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchStmPositionsSnapshot = createRemoteProcedureCall(fetchDescriptor)();

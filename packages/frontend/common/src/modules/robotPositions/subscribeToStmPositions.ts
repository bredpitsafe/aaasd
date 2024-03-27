import type {
    TSubscribeToStmPositionsRequestPayload,
    TSubscribeToStmPositionsResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToStmPositionsRequestPayload,
    TSubscribeToStmPositionsResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToStmPositions, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToStmPositions = createRemoteProcedureCall(subscriptionDescriptor)();

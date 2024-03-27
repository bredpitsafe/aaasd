import type { TSubscribeToStmBalancesRequestPayload } from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type { TSubscribeToStmBalancesResponsePayload } from './defs.ts';

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToStmBalancesRequestPayload,
    TSubscribeToStmBalancesResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToStmBalances, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToStmBalances = createRemoteProcedureCall(subscriptionDescriptor)();

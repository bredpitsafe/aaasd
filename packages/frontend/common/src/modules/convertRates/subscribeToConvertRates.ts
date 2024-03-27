import {
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToConvertRates.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const descriptor = createRemoteProcedureDescriptor<
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToConvertRates, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToConvertRates = createRemoteProcedureCall(descriptor)();

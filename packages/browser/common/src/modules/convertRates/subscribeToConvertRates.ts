import {
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload,
} from '@bhft/bff/src/modules/tradingDataProvider/schemas/SubscribeToConvertRates.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { ERemoteProcedureType, EServerRemoteProcedureName } from '../../utils/RPC/defs.ts';
export const descriptor = createRemoteProcedureDescriptor<
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload
>()(EServerRemoteProcedureName.SubscribeToConvertRates, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToConvertRates = createRemoteProcedureCall(descriptor)();

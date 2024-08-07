import type {
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToConvertRates.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';

export const descriptor = createRemoteProcedureDescriptor<
    TSubscribeToConvertRatesRequestPayload,
    TSubscribeToConvertRatesResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToConvertRates, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToConvertRates = createRemoteProcedureCall(descriptor)();

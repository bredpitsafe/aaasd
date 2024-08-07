import type {
    TFetchConvertRatesSnapshotRequestPayload,
    TFetchConvertRatesSnapshotResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchConvertRatesSnapshot.schema.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const descriptor = createRemoteProcedureDescriptor<
    TFetchConvertRatesSnapshotRequestPayload,
    TFetchConvertRatesSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchConvertRatesSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchConvertRatesSnapshot = createRemoteProcedureCall(descriptor)();

import type {
    TApproveInstrumentRequestPayload,
    TApproveInstrumentResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/ApproveInstrument.schema.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

const descriptor = createRemoteProcedureDescriptor<
    TApproveInstrumentRequestPayload,
    TApproveInstrumentResponsePayload
>()(EPlatformSocketRemoteProcedureName.ApproveInstrument, ERemoteProcedureType.Update);

export const ModuleApproveInstruments = createRemoteProcedureCall(descriptor)();

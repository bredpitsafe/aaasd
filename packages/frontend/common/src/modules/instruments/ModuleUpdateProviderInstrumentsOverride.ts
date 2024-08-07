import type {
    TUpdateProviderInstrumentsOverrideRequestPayload,
    TUpdateProviderInstrumentsOverrideResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/UpdateProviderInstrumentsOverride.schema.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

const descriptor = createRemoteProcedureDescriptor<
    TUpdateProviderInstrumentsOverrideRequestPayload,
    TUpdateProviderInstrumentsOverrideResponsePayload
>()(EPlatformSocketRemoteProcedureName.ApproveInstrument, ERemoteProcedureType.Update);

export const ModuleUpdateProviderInstrumentsOverride = createRemoteProcedureCall(descriptor)();

import type {
    TApproveIndexRequestPayload,
    TApproveIndexResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/ApproveIndex.schema.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

const descriptor = createRemoteProcedureDescriptor<
    TApproveIndexRequestPayload,
    TApproveIndexResponsePayload
>()(EPlatformSocketRemoteProcedureName.ApproveIndex, ERemoteProcedureType.Update);

export const ModuleApproveIndex = createRemoteProcedureCall(descriptor)();

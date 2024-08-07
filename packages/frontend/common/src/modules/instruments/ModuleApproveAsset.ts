import type {
    TApproveAssetRequestPayload,
    TApproveAssetResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/ApproveAsset.schema.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

const descriptor = createRemoteProcedureDescriptor<
    TApproveAssetRequestPayload,
    TApproveAssetResponsePayload
>()(EPlatformSocketRemoteProcedureName.ApproveAsset, ERemoteProcedureType.Update);

export const ModuleApproveAsset = createRemoteProcedureCall(descriptor)();

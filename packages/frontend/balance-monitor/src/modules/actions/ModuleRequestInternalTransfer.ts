import type { TInternalTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = TInternalTransferAction;

type TReceiveBody = {
    type: 'InternalTransferred';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RequestInternalTransfer,
    ERemoteProcedureType.Update,
);

export const ModuleRequestInternalTransfer = createRemoteProcedureCall(descriptor)();

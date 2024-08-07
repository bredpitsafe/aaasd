import type { TTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = TTransferAction;

type TReceiveBody = {
    type: 'Transferred';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RequestTransfer,
    ERemoteProcedureType.Update,
);

export const ModuleRequestTransfer = createRemoteProcedureCall(descriptor)();

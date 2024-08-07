import type { TRuleId } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = {
    id: TRuleId;
};

type TReceiveBody = { type: 'TransferRuleDeleted' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.DeleteTransferRule,
    ERemoteProcedureType.Update,
);

export const ModuleDeleteTransferRule = createRemoteProcedureCall(descriptor)();

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

type TReceiveBody = { type: 'LimitingTransferRuleDeleted' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.DeleteLimitingTransferRule,
    ERemoteProcedureType.Update,
);

export const ModuleDeleteLimitingTransferRule = createRemoteProcedureCall(descriptor)();

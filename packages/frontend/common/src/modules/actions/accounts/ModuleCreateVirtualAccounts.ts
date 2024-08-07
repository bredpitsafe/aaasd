import type { TRealAccount, TVirtualAccount } from '../../../types/domain/account.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';

export type TCreatableVirtualAccount = Pick<TVirtualAccount, 'name' | 'isInternal'> & {
    realAccountIds: TRealAccount['id'][];
};

type TSendBody = {
    virtualAccounts: TCreatableVirtualAccount[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.CreateVirtualAccounts,
    ERemoteProcedureType.Update,
);

export const ModuleCreateVirtualAccounts = createRemoteProcedureCall(descriptor)();

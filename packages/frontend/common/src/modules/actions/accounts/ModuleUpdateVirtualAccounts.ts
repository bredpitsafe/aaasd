import type { TVirtualAccount } from '../../../types/domain/account.ts';
import type { TRealAccount } from '../../../types/domain/account.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';

export type TUpdatableVirtualAccount = Omit<TVirtualAccount, 'realAccounts'> & {
    realAccounts: Pick<TRealAccount, 'id'>[];
};

type TSendBody = {
    virtualAccounts: TUpdatableVirtualAccount[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateVirtualAccounts,
    ERemoteProcedureType.Update,
);

export const ModuleUpdateVirtualAccounts = createRemoteProcedureCall(descriptor)();

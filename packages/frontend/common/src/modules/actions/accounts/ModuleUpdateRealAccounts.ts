import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import type { TUpdatableRealAccount, TUpdatableRealAccountSendBody } from './def.ts';
import { getSendBodyAccounts } from './utils.ts';

type TSendBody = {
    accounts: TUpdatableRealAccountSendBody[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateAccounts,
    ERemoteProcedureType.Update,
);

export const ModuleUpdateRealAccounts = createRemoteProcedureCall(descriptor)({
    getParams: (params: { target: TSocketURL; accounts: TUpdatableRealAccount[] }) => {
        return {
            target: params.target,
            accounts: getSendBodyAccounts(params.accounts),
        };
    },
});

import { toMilliseconds } from '@common/utils';

import type { TRealAccount } from '../../../types/domain/account.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import type { THandlerStreamOptions, TRequestStreamOptions } from '../def.ts';
import { convertToSubscriptionEventValueDescriptor, pollIntervalForRequest } from '../utils.ts';

type TSendBody = Pick<TRequestStreamOptions, 'pollInterval'>;

type TReceiveBody = {
    type: 'AccountUpdates';
    accounts: TRealAccount[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToAccounts,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToRealAccountsUpdates = createRemoteProcedureCall(descriptor)({
    getParams: (params: Pick<THandlerStreamOptions, 'pollInterval'> & TWithSocketTarget) => {
        return {
            ...params,
            pollInterval: pollIntervalForRequest(params.pollInterval ?? toMilliseconds(1000)),
        };
    },
    getPipe: () => {
        return convertToSubscriptionEventValueDescriptor((payload) => payload.accounts);
    },
});

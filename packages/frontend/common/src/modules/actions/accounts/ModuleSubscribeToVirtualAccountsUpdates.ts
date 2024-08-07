import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import { toMilliseconds } from '@common/utils';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TVirtualAccount } from '../../../types/domain/account.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import type { THandlerStreamOptions, TRequestStreamOptions } from '../def.ts';
import { convertToSubscriptionEventValueDescriptor, pollIntervalForRequest } from '../utils.ts';

type TSendBody = Pick<TRequestStreamOptions, 'pollInterval'>;

type TReceiveBody = {
    type: 'VirtualAccountUpdates';
    virtualAccounts: TVirtualAccount[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToVirtualAccounts,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToVirtualAccountsUpdates = createRemoteProcedureCall(descriptor)({
    getParams: (params: Pick<THandlerStreamOptions, 'pollInterval'> & TWithSocketTarget) => {
        return {
            ...params,
            pollInterval: pollIntervalForRequest(params.pollInterval ?? toMilliseconds(1000)),
        };
    },
    getPipe: () => {
        return convertToSubscriptionEventValueDescriptor((payload) => payload.virtualAccounts);
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../../defs/observables.ts';
import { getSocketUrlHash } from '../../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';

type TSendBody = {};

type TReceiveBody = {
    execGates: string[];
    mdGates: string[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ListGateKinds,
    ERemoteProcedureType.Request,
);

export const ModuleFetchGateKinds = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload)),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

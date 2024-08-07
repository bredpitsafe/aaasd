import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../../defs/observables.ts';
import { getSocketUrlHash } from '../../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';

type TSendBody = {
    componentId: number;
    digest: string;
};

type TReceiveBody = {
    state: string;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchComponentState,
    ERemoteProcedureType.Request,
);

export const ModuleFetchComponentState = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.state)),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

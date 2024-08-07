import { subscribeToComponentsSnapshotProcedureDescriptor } from '../../../actors/ComponentsDataProvider/descriptors.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';

export const ModuleSubscribeToComponentsSnapshot = createRemoteProcedureCall(
    subscribeToComponentsSnapshotProcedureDescriptor,
)({
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

import { SubscribeToComponentStateRevisionsSnapshotProcedureDescriptor } from '../../../actors/TradingServersManager/descriptors.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';

export const ModuleSubscribeToComponentStateRevisionsSnapshot = createRemoteProcedureCall(
    SubscribeToComponentStateRevisionsSnapshotProcedureDescriptor,
)({
    dedobs: {
        normalize: ([props]) =>
            semanticHash.get(props, { target: semanticHash.withHasher(getSocketUrlHash) }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { TEmptySendBody } from '@frontend/balance-monitor/src/modules/actions/defs.ts';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TAsset } from '../../../types/domain/asset.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TReceiveBody = { assets: TAsset[] };

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ListAssets,
    ERemoteProcedureType.Request,
);

export const ModuleFetchAssets = createRemoteProcedureCall(descriptor)({
    getPipe: () => {
        return mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.assets));
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

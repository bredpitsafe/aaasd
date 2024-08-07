import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import { pipe } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import type {
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../../../modules/actions/def.ts';
import type { TBacktestingRun } from '../../../types/domain/backtestings';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { mapValueDescriptor, scanValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../../utils/semanticHash';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';

type TSendBody = TRequestStreamOptions & {
    taskId: number;
    snapshotOnly?: boolean;
};

type TReceiveBody =
    | TSubscribed
    | (TWithSnapshot & {
          type: 'BacktestRuns';
          runs: TBacktestingRun[];
      });

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToBacktestRuns,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToBacktestingRuns = createRemoteProcedureCall(descriptor)({
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
    getPipe: () =>
        pipe(
            scanValueDescriptor(
                (
                    acc: undefined | TValueDescriptor2<UnifierWithCompositeHash<TBacktestingRun>>,
                    { value },
                ) => {
                    const unifier =
                        acc?.value ?? new UnifierWithCompositeHash<TBacktestingRun>('btRunNo');

                    if (value.payload.type === 'Subscribed') {
                        return createSyncedValueDescriptor(unifier);
                    }

                    if (value.payload.isSnapshot) {
                        unifier.clear();
                    }

                    unifier.modify(value.payload.runs);

                    return createSyncedValueDescriptor(unifier);
                },
            ),
            mapValueDescriptor(({ value }) => value.toArray()),
        ),
});

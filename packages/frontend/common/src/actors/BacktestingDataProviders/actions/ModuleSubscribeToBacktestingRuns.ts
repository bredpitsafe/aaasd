import { pipe } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import type { TRequestStreamOptions, TSubscribed, TWithSnapshot } from '../../../handlers/def';
import { TBacktestingRun } from '../../../types/domain/backtestings';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor, scanValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
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
        normalize: ([params]) => {
            return semanticHash.get(params, {
                target: semanticHash.withHasher(shallowHash),
            });
        },
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
    getPipe: () => {
        return pipe(
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
        );
    },
});

import type { THerodotusTask } from '@frontend/herodotus/src/types/domain.ts';
import { EHerodotusTaskStatus } from '@frontend/herodotus/src/types/domain.ts';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { DEFAULT_RETRY_DELAY } from '../../../modules/actions/def.ts';
import { ModuleFetchHerodotusTasksSnapshot } from '../../../modules/actions/herodotus/ModuleFetchHerodotusTasksSnapshot.ts';
import { ModuleSubscribeToHerodotusTasks } from '../../../modules/actions/herodotus/ModuleSubscribeToHerodotusTasks.ts';
import type { TRobotId } from '../../../types/domain/robots';
import type { TSocketURL } from '../../../types/domain/sockets';
import { Fail } from '../../../types/Fail';
import { EGrpcErrorCode } from '../../../types/GrpcError.ts';
import { createSubscriptionWithSnapshot2 } from '../../../utils/createSubscriptionWithSnapshot2.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { selectFreshTask, sortTasks } from '../util';

type TGetHerodotusTasksParams = {
    target: TSocketURL;
    robotId: TRobotId;
};

const UNKNOWN_FAIL = Fail(EGrpcErrorCode.UNKNOWN, {
    message: 'Unknown error',
});
export type TGetArchivedHerodotusTasksResult = TValueDescriptor2<THerodotusTask[]>;

const startSubscription = createSubscriptionWithSnapshot2<THerodotusTask>({
    handleSubscriptionError: () => ({
        fail: UNKNOWN_FAIL,
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
    handleFetchError: () => ({
        fail: UNKNOWN_FAIL,
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
});

export const ModuleGetArchivedHerodotusTasks = createObservableProcedure(
    (ctx) => {
        const fetch = ModuleFetchHerodotusTasksSnapshot(ctx);
        const subscribe = ModuleSubscribeToHerodotusTasks(ctx);

        return (params: TGetHerodotusTasksParams, options) => {
            const cache = new UnifierWithCompositeHash<THerodotusTask>('taskId', {
                removePredicate(task) {
                    return (
                        task.status === EHerodotusTaskStatus.started ||
                        task.status === EHerodotusTaskStatus.paused ||
                        task.status === EHerodotusTaskStatus.deleted
                    );
                },
                upsertPredicate: selectFreshTask,
            });

            return startSubscription({
                cache,
                subscribe: () =>
                    subscribe(
                        { target: params.target, filters: { robotId: params.robotId } },
                        options,
                    ),
                fetch: () =>
                    fetch(
                        {
                            target: params.target,
                            filters: {
                                robotId: params.robotId,
                                statuses: [EHerodotusTaskStatus.archived],
                            },
                            // Temporarily set very high limit. Normally we move to infinity history pagination.
                            limit: 10_000,
                        },
                        options,
                    ),
            }).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(sortTasks(value));
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, { target: semanticHash.withHasher(getSocketUrlHash) }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);

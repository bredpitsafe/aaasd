import { type Observable, map } from 'rxjs';

import { EHerodotusTaskStatus, THerodotusTask } from '../../../../../herodotus/src/types/domain';
import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { fetchHerodotusTasksSnapshotHandle } from '../../../handlers/fetchHerodotusTasksSnapshotHandle';
import { subscribeToHerodotusTasksHandle } from '../../../handlers/subscribeToHerodotusTasksHandle';
import { DEFAULT_RETRY_DELAY } from '../../../modules/actions/defs';
import { THandlerOptions } from '../../../modules/communicationHandlers/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TRobotId } from '../../../types/domain/robots';
import { TSocketURL } from '../../../types/domain/sockets';
import { FailFactory } from '../../../types/Fail';
import { createSubscriptionWithSnapshot } from '../../../utils/createSubscriptionWithSnapshot';
import { dedobs } from '../../../utils/observable/memo';
import { shallowHash } from '../../../utils/shallowHash';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import {
    ExtractValueDescriptor,
    isSyncDesc,
    ValueDescriptorFactory,
} from '../../../utils/ValueDescriptor';
import { selectFreshTask, sortTasks } from '../util';

type TGetHerodotusTasksParams = {
    robotId: TRobotId;
};
const ArchivedHerodotusTasksGetFail = FailFactory('getArchivedHerodotusTasks');
const UNKNOWN_FAIL = ArchivedHerodotusTasksGetFail('UNKNOWN');
const HerodotusTasksGet = ValueDescriptorFactory<THerodotusTask[], typeof UNKNOWN_FAIL>(); // x
export type TGetArchivedHerodotusTasksResult = ExtractValueDescriptor<typeof HerodotusTasksGet>;

const startSubscription = createSubscriptionWithSnapshot({
    valueDescProducer: HerodotusTasksGet,
    handleSubscriptionError: () => ({
        fail: UNKNOWN_FAIL,
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
    handleFetchError: () => ({
        fail: null,
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
});

export const getArchivedHerodotusTasks = dedobs(
    (
        ctx: TContextRef,
        url: TSocketURL,
        params: TGetHerodotusTasksParams,
        options: THandlerOptions,
    ): Observable<TGetArchivedHerodotusTasksResult> => {
        const { requestStream, request } = ModuleCommunicationHandlersRemoted(ctx);
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
                subscribeToHerodotusTasksHandle(
                    requestStream,
                    url,
                    { filters: { robotId: params.robotId } },
                    options,
                ),
            fetch: () =>
                fetchHerodotusTasksSnapshotHandle(
                    request,
                    url,
                    {
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
            map((tasksDesc) => {
                if (isSyncDesc(tasksDesc)) {
                    return HerodotusTasksGet.sync(sortTasks(tasksDesc.value), null);
                }
                return tasksDesc;
            }),
        );
    },
    {
        normalize: ([c, url, { robotId }]) => shallowHash(c, url, robotId),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

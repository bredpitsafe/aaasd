import { compareDates } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { get, isArray } from 'lodash-es';
import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { ModuleFactory } from '../../../di';
import type { TWithTraceId } from '../../../modules/actions/def.ts';
import { UPDATES_ONLY } from '../../../modules/actions/def.ts';
import type {
    TBacktestingRunId,
    TBacktestingTask,
    TBacktestingTaskId,
} from '../../../types/domain/backtestings';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets';
import { Fail } from '../../../types/Fail';
import { EGrpcErrorCode, GrpcError } from '../../../types/GrpcError';
import { createSubscriptionWithSnapshot2 } from '../../../utils/createSubscriptionWithSnapshot2';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { dedobs } from '../../../utils/observable/memo';
import { semanticHash } from '../../../utils/semanticHash';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { ModuleFetchBacktestingTasksSnapshot } from './ModuleFetchBacktestingTasksSnapshot';
import { ModuleSubscribeToBacktestingTasks } from './ModuleSubscribeToBacktestingTasks';

export type TSubscribeToBacktestingTasksSnapshotProps = {
    filters?: {
        ids?: TBacktestingTaskId[];
        btRuns?: TBacktestingRunId[];
    };
};

const startSubscription = createSubscriptionWithSnapshot2<TBacktestingTask>({
    handleFetchError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: 2000,
    }),
    handleSubscriptionError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: 2000,
    }),
});

export const ModuleSubscribeToBacktestingTasksSnapshot = ModuleFactory((ctx) => {
    const fetch = ModuleFetchBacktestingTasksSnapshot(ctx);
    const subscribe = ModuleSubscribeToBacktestingTasks(ctx);

    return dedobs(
        (
            target: TSocketURL | TSocketStruct,
            props: TSubscribeToBacktestingTasksSnapshotProps,
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TBacktestingTask[]>> => {
            const cache = new UnifierWithCompositeHash<TBacktestingTask>('id', {
                removePredicate(task: TBacktestingTask) {
                    const ids = props.filters?.ids;
                    if (!isArray(ids)) return false;
                    return !ids.includes(task.id);
                },
                upsertPredicate(first: TBacktestingTask | undefined, second: TBacktestingTask) {
                    return first === undefined ||
                        compareDates(second.platformTime, first.platformTime) >= 0
                        ? second
                        : first;
                },
            });

            return startSubscription({
                cache,
                subscribe: () => subscribe({ target, ...props }, { ...options, ...UPDATES_ONLY }),
                fetch: () =>
                    fetch(
                        {
                            target,
                            params: {
                                limit: 300,
                                offset: 0,
                            },
                            sort: {
                                fieldsOrder: undefined,
                            },
                            filters: props.filters,
                            mods: {
                                withTotal: false,
                            },
                        },
                        options,
                    ),
            });
        },
        {
            normalize: ([url, params]) =>
                semanticHash.get(
                    { url, params },
                    {
                        url: semanticHash.withHasher(getSocketUrlHash),
                        params: {
                            filters: {
                                ...semanticHash.withNullable(isDeepObjectEmpty),
                                ...semanticHash.withHasher<
                                    TSubscribeToBacktestingTasksSnapshotProps['filters']
                                >((filters) =>
                                    semanticHash.get(filters, {
                                        ids: semanticHash.withSorter(null),
                                        btRuns: semanticHash.withSorter(null),
                                    }),
                                ),
                            },
                        },
                    },
                ),

            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

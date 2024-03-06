import { get, isArray } from 'lodash-es';
import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { ModuleFactory } from '../../../di';
import { TWithTraceId, UPDATES_ONLY } from '../../../handlers/def';
import {
    TBacktestingRunId,
    TBacktestingTask,
    TBacktestingTaskId,
} from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { Fail } from '../../../types/Fail';
import { EGrpcErrorCode, GrpcError } from '../../../types/GrpcError';
import { createSubscriptionWithSnapshot2 } from '../../../utils/createSubscriptionWithSnapshot2';
import { dedobs } from '../../../utils/observable/memo';
import { semanticHash } from '../../../utils/semanticHash';
import { shallowHash } from '../../../utils/shallowHash';
import { compareDates } from '../../../utils/timeCompare';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { ModuleFetchBacktestingTasksSnapshot } from './ModuleFetchBacktestingTasksSnapshot';
import { ModuleSubscribeToBacktestingTasks } from './ModuleSubscribeToBacktestingTasks';

export type TGetBacktestingTasksParams = {
    filters?: {
        btRuns?: Array<TBacktestingRunId>;
        ids?: Array<TBacktestingTaskId>;
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
            target: TSocketURL,
            params: TGetBacktestingTasksParams,
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TBacktestingTask[]>> => {
            const cache = new UnifierWithCompositeHash<TBacktestingTask>('id', {
                removePredicate(task: TBacktestingTask) {
                    const ids = params.filters?.ids;
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
                subscribe: () => subscribe({ target, ...params }, { ...options, ...UPDATES_ONLY }),
                fetch: () =>
                    fetch(
                        {
                            target,
                            slice: {
                                limit: 300,
                                offset: 0,
                            },
                            sort: {
                                fieldsOrder: undefined,
                            },
                            filters: params.filters,
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
                shallowHash(
                    url,
                    semanticHash.get(params, {
                        filters: {
                            ids: semanticHash.withSorter(null),
                            btRuns: semanticHash.withSorter(null),
                        },
                    }),
                ),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

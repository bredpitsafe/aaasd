import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TBacktestingRunId,
    TBacktestingTaskId,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';

import { EBacktestingSearchParams } from '../../defs/router.ts';
import { ModuleBacktestingRouter } from '../router/module.ts';

type TRouterParams = Readonly<{
    stage: undefined | TSocketName;
    url: undefined | TSocketURL;
    taskId: undefined | TBacktestingTaskId;
    runId: undefined | TBacktestingRunId;
}>;

export const ModuleSubscribeToRouterParams = ModuleFactory((ctx) => {
    const socketPage = ModuleSocketPage(ctx);
    const { state$ } = ModuleBacktestingRouter(ctx);

    return dedobs(
        <T extends keyof TRouterParams>(fields: T[]): Observable<Pick<TRouterParams, T>> => {
            return combineLatest([
                socketPage.currentSocketStruct$,
                state$.pipe(
                    map((v) => ({
                        taskId: extractRouterParam(
                            v.route,
                            EBacktestingSearchParams.BacktestingTaskId,
                        ),
                        runId: extractRouterParam(
                            v.route,
                            EBacktestingSearchParams.BacktestingRunId,
                        ),
                    })),
                    distinctUntilChanged(),
                ),
            ]).pipe(
                map(([socket, { runId, taskId }]) => {
                    return {
                        stage: fields.includes('stage' as T) ? socket?.name : undefined,
                        url: fields.includes('url' as T) ? socket?.url : undefined,
                        taskId:
                            fields.includes('taskId' as T) && !isNil(taskId) ? taskId : undefined,
                        runId: fields.includes('runId' as T) && !isNil(taskId) ? runId : undefined,
                    };
                }),
                distinctUntilChanged((a, b) => {
                    return fields.every((key) => a[key] === b[key]);
                }),
            );
        },
        {
            normalize: ([fields]) => shallowHash(...fields.sort()),
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: SHARE_RESET_DELAY,
        },
    );
});

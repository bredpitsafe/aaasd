import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotConfig, TRobotConfigRecord } from '@frontend/common/src/modules/actions/def.ts';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
    squashValueDescriptors,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleSubscribeToBacktestingRun } from './ModuleSubscribeToBacktestingRun';
import { ModuleSubscribeToRobotsConfigRecord } from './ModuleSubscribeToRobotsConfigRecord';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';
import { ModuleSubscribeToRunRobots } from './ModuleSubscribeToRunRobots';

const EMPTY_CONFIGS_ARRAY$ = of(createSyncedValueDescriptor(EMPTY_ARRAY as TRobotConfig[]));

export const ModuleSubscribeToCurrentRobotsConfigs = ModuleFactory((ctx) => {
    const subscribeToRunRobots = ModuleSubscribeToRunRobots(ctx);
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToRobotsConfigs = ModuleSubscribeToRobotsConfigRecord(ctx);
    const subscribeToBacktestingRun = ModuleSubscribeToBacktestingRun(ctx);

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TRobotConfigRecord>> =>
            subscribeToRouterParams(['url', 'taskId', 'runId']).pipe(
                switchMap((model) => {
                    const url = model?.url;
                    const runId = model?.runId;
                    const taskId = model?.taskId;

                    if (isNil(url) || isNil(taskId) || isNil(runId)) {
                        return of(WAITING_VD);
                    }

                    const robotIds$ = subscribeToRunRobots(url, taskId, traceId).pipe(
                        mapValueDescriptor(({ value: robots }) => {
                            return createSyncedValueDescriptor(
                                robots.map((robot) => robot.id).sort(),
                            );
                        }),
                        distinctValueDescriptorUntilChanged(),
                    );
                    const run$ = subscribeToBacktestingRun(url, taskId, runId, traceId).pipe(
                        distinctValueDescriptorUntilChanged((a, b) => {
                            return a?.status === b?.status;
                        }),
                    );

                    return combineLatest([robotIds$, run$]).pipe(
                        squashValueDescriptors(),
                        switchMapValueDescriptor(({ value: [robotIds, run] }) => {
                            if (
                                isEmpty(robotIds) ||
                                isNil(run) ||
                                !isRunningOrSucceed(run.status)
                            ) {
                                return EMPTY_CONFIGS_ARRAY$;
                            }

                            return subscribeToRobotsConfigs(url, runId, robotIds, traceId);
                        }),
                    );
                }),
            ),
        {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

function isRunningOrSucceed(status: EBacktestingRunStatus) {
    return EBacktestingRunStatus.Running === status || EBacktestingRunStatus.Succeed === status;
}

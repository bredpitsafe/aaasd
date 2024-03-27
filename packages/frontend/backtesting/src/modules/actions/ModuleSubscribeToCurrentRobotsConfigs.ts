import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotConfig, TRobotConfigRecord } from '@frontend/common/src/handlers/def';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import { toSwitch } from '@frontend/common/src/utils/Rx/dynamicMap';
import {
    distinctValueDescriptorUntilChanged,
    dynamicMapValueDescriptor,
    mapValueDescriptor,
    squashArrayValueDescriptors,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isNil } from 'lodash-es';
import { combineLatest, Observable, of } from 'rxjs';
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
                        squashArrayValueDescriptors(),
                        dynamicMapValueDescriptor(({ value: [robotIds, run] }) => {
                            if (
                                isEmpty(robotIds) ||
                                isNil(run) ||
                                !isRunningOrSucceed(run.status)
                            ) {
                                return toSwitch(EMPTY_CONFIGS_ARRAY$);
                            }

                            return toSwitch(
                                subscribeToRobotsConfigs(url, runId, robotIds, traceId),
                            );
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

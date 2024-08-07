import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotDashboard } from '@frontend/common/src/modules/actions/def.ts';
import type {
    TBacktestingRunId,
    TBacktestingTaskId,
} from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
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
import { ModuleSubscribeToBacktestingTask } from './ModuleSubscribeToBacktestingTask';
import { ModuleSubscribeToRobotDashboards } from './ModuleSubscribeToRobotDashboards';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';
import { ModuleSubscribeToRunRobots } from './ModuleSubscribeToRunRobots';

const EMPTY_DASHBOARD_ARRAY = createSyncedValueDescriptor(EMPTY_ARRAY as TRobotDashboard[]);

export const ModuleSubscribeToCurrentRobotDashboards = ModuleFactory((ctx) => {
    const subscribeToBacktestingTask = ModuleSubscribeToBacktestingTask(ctx);
    const subscribeToRobotDashboards = ModuleSubscribeToRobotDashboards(ctx);
    const subscribeToBacktestingRun = ModuleSubscribeToBacktestingRun(ctx);
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToRunRobots = ModuleSubscribeToRunRobots(ctx);

    function subscribeToRobotDashboardsWithFocusTo(
        target: TSocketURL,
        taskId: TBacktestingTaskId,
        runId: TBacktestingRunId,
        robotIds: TRobotId[],
        traceId: TraceId,
    ) {
        return combineLatest([
            subscribeToRobotDashboards(target, runId, robotIds, traceId),
            subscribeToBacktestingTask({ target, taskId }, { traceId }),
            subscribeToBacktestingRun(target, taskId, runId, traceId),
        ]).pipe(
            squashValueDescriptors(),
            mapValueDescriptor(({ value: [dashboards, task, run] }) => {
                return createSyncedValueDescriptor(
                    dashboards.map((dashboard) => {
                        const focusTo = run?.simulationStartTime ?? task?.simulationData.startTime;

                        return {
                            ...dashboard,
                            focusTo,
                        } as TRobotDashboard;
                    }),
                );
            }),
        );
    }

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TRobotDashboard[]>> => {
            return subscribeToRouterParams(['url', 'taskId', 'runId']).pipe(
                switchMap((model) => {
                    const url = model?.url;
                    const runId = model?.runId;
                    const taskId = model?.taskId;

                    return isNil(url) || isNil(runId) || isNil(taskId)
                        ? of(WAITING_VD)
                        : subscribeToRunRobots(url, taskId, traceId).pipe(
                              mapValueDescriptor(({ value: robots }) => {
                                  return createSyncedValueDescriptor(
                                      robots.map(({ id }) => id).sort(),
                                  );
                              }),
                              distinctValueDescriptorUntilChanged(),
                              switchMapValueDescriptor(({ value: robotIds }) => {
                                  return isEmpty(robotIds)
                                      ? of(EMPTY_DASHBOARD_ARRAY)
                                      : subscribeToRobotDashboardsWithFocusTo(
                                            url,
                                            taskId,
                                            runId,
                                            robotIds,
                                            traceId,
                                        );
                              }),
                          );
                }),
            );
        },
        {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

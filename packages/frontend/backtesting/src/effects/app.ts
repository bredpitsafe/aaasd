import type { TContextRef } from '@frontend/common/src/di';
import { EFetchSortOrder } from '@frontend/common/src/handlers/def';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { ModuleSystemNotifications } from '@frontend/common/src/modules/systemNotifications/module';
import type { Nil } from '@frontend/common/src/types';
import { EApplicationName } from '@frontend/common/src/types/app';
import {
    EBacktestingRunStatus,
    EBacktestingTaskStatus,
    TBacktestingRun,
    TBacktestingTask,
    TBacktestingTaskId,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { TActorReceive } from '@frontend/common/src/utils/RPC/types.ts';
import { logError, logFail } from '@frontend/common/src/utils/Rx/log';
import { ModuleNotifyError, ModuleNotifyFail } from '@frontend/common/src/utils/Rx/ModuleNotify';
import { scanPrevNext } from '@frontend/common/src/utils/Rx/prevNext';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import type { ExtractSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isNil, sortBy } from 'lodash-es';
import { combineLatest, EMPTY, first, forkJoin, of } from 'rxjs';
import { distinctUntilChanged, filter, map, scan, startWith, switchMap } from 'rxjs/operators';

import { EBacktestingRoute } from '../defs/router';
import { ModuleBacktestingTaskLookupsDataProvider } from '../modules/actions/ModuleBacktestingTaskLookupsDataProvider';
import { ModuleSubscribeToBacktestingRuns } from '../modules/actions/ModuleSubscribeToBacktestingRuns';
import { ModuleSubscribeToRouterParams } from '../modules/actions/ModuleSubscribeToRouterParams';
import { ModuleBacktestingRouter } from '../modules/router/module';
import { EBacktestingSettings } from '../widgets/Settings/def';
import { DEFAULT_SHOW_RUN_STATUS_NOTIFICATION } from '../widgets/Settings/useShowRunStatusNotifications';

export function initAppEffects(ctx: TContextRef) {
    initAutoSelectRunId(ctx);
    initNotifyCompletedRun(ctx);
}

function initAutoSelectRunId(ctx: TContextRef) {
    const { navigate } = ModuleBacktestingRouter(ctx);
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);

    const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);
    const notifyFail = ModuleNotifyFail(ctx);
    const notifyError = ModuleNotifyError(ctx);

    subscribeToRouterParams(['url', 'stage', 'taskId'])
        .pipe(
            switchMap(({ url, stage, taskId }) => {
                return isNil(url) || isNil(stage) || isNil(taskId)
                    ? EMPTY
                    : forkJoin({
                          stage: of(stage),
                          taskId: of(taskId),
                          runs: subscribeToBacktestingRuns(
                              {
                                  target: url,
                                  taskId,
                              },
                              { traceId: generateTraceId() },
                          ).pipe(
                              logFail(),
                              notifyFail(),
                              first(
                                  (
                                      vd,
                                  ): vd is ExtractSyncedValueDescriptor<
                                      TActorReceive<TBacktestingRun[]>
                                  > => isSyncedValueDescriptor(vd) && !isEmpty(vd.value),
                              ),
                          ),
                      });
            }),
            logError(),
            notifyError(),
        )
        .subscribe(({ stage, taskId, runs }) => {
            if (runs.value.length > 0) {
                void navigate(
                    EBacktestingRoute.Backtesting,
                    {
                        socket: stage,
                        backtestingTaskId: taskId,
                        backtestingRunId: runs.value[0].btRunNo,
                    },
                    { replace: true },
                );
            }
        });
}

function initNotifyCompletedRun(ctx: TContextRef) {
    const { navigateNewTab } = ModuleBacktestingRouter(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);
    const { permission$, createNotification } = ModuleSystemNotifications(ctx);
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const { subscribe } = ModuleBacktestingTaskLookupsDataProvider(ctx);

    const showNotification$ = getAppSettings$<boolean>(
        EApplicationName.BacktestingManager,
        EBacktestingSettings.RunStatusNotifications,
    ).pipe(startWith(DEFAULT_SHOW_RUN_STATUS_NOTIFICATION), distinctUntilChanged());

    const notificationsMap = new Map<string, Notification>();

    combineLatest([permission$, showNotification$])
        .pipe(
            map(
                ([permission, showNotification]) =>
                    permission === 'granted' && showNotification === true,
            ),
            switchMap((watch) =>
                watch
                    ? subscribeToRouterParams(['url', 'stage']).pipe(
                          switchMap(({ url, stage }) =>
                              isNil(url) || isNil(stage)
                                  ? EMPTY
                                  : subscribe(
                                        url,
                                        {
                                            sort: [['id', EFetchSortOrder.Desc]],
                                            filters: undefined,
                                        },
                                        {
                                            traceId: generateTraceId(),
                                        },
                                    ).pipe(
                                        map(({ payload }) => payload),
                                        filter((tasks): tasks is TBacktestingTask[] =>
                                            Array.isArray(tasks),
                                        ),
                                        createCurrentSnapshot(),
                                        scanPrevNext(),
                                        mapToAlertTasks(stage),
                                        filter((entries) => !isEmpty(entries)),
                                    ),
                          ),
                      )
                    : EMPTY,
            ),
        )
        .subscribe((alertTasks) => {
            for (const alertTask of alertTasks) {
                const key = `task-status-${alertTask.stage}-${alertTask.taskId}`;

                if (isNil(alertTask.diffStatus)) {
                    notificationsMap.get(key)?.close();
                    continue;
                }

                const greeting = createNotification('Run statuses changed', {
                    requireInteraction: true,
                    tag: key,
                    body: `"${alertTask.name}" runs has new statuses: ${alertTask.diffStatus
                        .map(([status, count]) => `${status} - ${count}`)
                        .join(', ')}`,
                });

                if (isNil(greeting)) {
                    continue;
                }

                notificationsMap.set(key, greeting);

                if (!isNil(alertTask.btRunNo)) {
                    const navigateToBtRun = () => {
                        navigateNewTab(EBacktestingRoute.Backtesting, {
                            socket: alertTask.stage,
                            backtestingTaskId: alertTask.taskId,
                            backtestingRunId: alertTask.btRunNo!,
                        });

                        greeting.close();

                        finalize();
                    };
                    const finalize = () => {
                        greeting.removeEventListener('click', navigateToBtRun);
                        greeting.removeEventListener('close', finalize);
                    };

                    greeting.addEventListener('click', navigateToBtRun);
                    greeting.addEventListener('close', finalize);
                }
            }
        });
}

function createCurrentSnapshot() {
    return scan((acc: TBacktestingTask[], update: TBacktestingTask[]) => {
        const newIds = new Set(update.map(({ id }) => id));

        return acc
            .filter(({ id }) => !newIds.has(id))
            .concat(update.filter(({ status }) => status !== EBacktestingTaskStatus.Archived));
    }, []);
}

function mapToAlertTasks(stage: TSocketName) {
    type TAlertTask = {
        stage: TSocketName;
        taskId: TBacktestingTaskId;
        name: string;
        description: string;
        totalBtRuns: number;
        btRunNo: number | null;
        user: string | null;
        diffStatus: [EBacktestingRunStatus, number][] | undefined;
    };

    return map(([prev, next]: [TBacktestingTask[], TBacktestingTask[]]): TAlertTask[] => {
        const prevMap = new Map(prev.map((task) => [task.id, task]));
        const nextMap = new Map(next.map((task) => [task.id, task]));

        const diffMap = new Map<number, Omit<TAlertTask, 'stage' | 'taskId'>>();

        for (const taskId of new Set([...prevMap.keys(), ...nextMap.keys()])) {
            const prevTask = prevMap.get(taskId);
            const nextTask = nextMap.get(taskId);

            if (isNil(nextTask)) {
                if (!isNil(prevTask)) {
                    const { name, description, totalBtRuns, user, maxBtRunNo } = prevTask;

                    diffMap.set(taskId, {
                        name,
                        description,
                        totalBtRuns,
                        user,
                        btRunNo: maxBtRunNo,
                        diffStatus: undefined,
                    });
                }
                continue;
            }

            const { name, description, totalBtRuns, user, maxBtRunNo } = nextTask;

            const diffStatus = getDiffRunStatuses(prevTask?.runsStatus, nextTask.runsStatus);

            if (!isEmpty(diffStatus)) {
                diffMap.set(taskId, {
                    name,
                    description,
                    totalBtRuns,
                    user,
                    btRunNo: maxBtRunNo,
                    diffStatus,
                });
            }
        }

        return Array.from(diffMap.entries()).map(([taskId, props]) => ({
            stage,
            taskId,
            ...props,
        }));
    });
}

const FINAL_STATUSES = [
    EBacktestingRunStatus.Succeed,
    EBacktestingRunStatus.Failed,
    EBacktestingRunStatus.Stopped,
];

function getDiffRunStatuses(
    prev: [EBacktestingRunStatus, number][] | Nil,
    next: [EBacktestingRunStatus, number][] | Nil,
): [EBacktestingRunStatus, number][] {
    const prevStatuses = new Map(prev?.filter(([status]) => FINAL_STATUSES.includes(status)));
    const nextStatuses = new Map(next?.filter(([status]) => FINAL_STATUSES.includes(status)));

    const diffStatuses = new Map<EBacktestingRunStatus, number>();

    for (const status of prevStatuses.keys()) {
        const prevCount = prevStatuses.get(status) ?? 0;
        const nextCount = nextStatuses.get(status) ?? 0;

        if (nextCount > prevCount) {
            diffStatuses.set(status, nextCount - prevCount);
        }
    }

    for (const status of nextStatuses.keys()) {
        const nextCount = nextStatuses.get(status) ?? 0;

        if (!prevStatuses.has(status) && nextCount > 0) {
            diffStatuses.set(status, nextCount);
        }
    }

    return sortBy(Array.from(diffStatuses.entries()), ([status]) => status);
}

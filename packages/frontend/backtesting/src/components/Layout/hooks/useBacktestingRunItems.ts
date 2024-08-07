import type { Nil } from '@common/types';
import type { TraceId } from '@common/utils';
import {
    getNowMilliseconds,
    iso2milliseconds,
    iso2NanoDate,
    minus,
    NanoDate,
    plus,
} from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithTraceId } from '@frontend/common/src/modules/actions/def.ts';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import type {
    TBacktestingRun,
    TBacktestingRunId,
    TBacktestingTask,
} from '@frontend/common/src/types/domain/backtestings';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import type { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    findWorstUnsyncedValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    REQUESTING_VD,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil, mapValues } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, map, of, switchMap } from 'rxjs';

import type {
    TBacktestingRunBuildInfoSnapshot,
    TBacktestingRunBuildInfoSnapshotNode,
} from '../../../modules/actions/ModuleFetchBacktestingRunsBuildInfo';
import { ModuleFetchBacktestingRunsBuildInfo } from '../../../modules/actions/ModuleFetchBacktestingRunsBuildInfo';
import { ModuleSubscribeToBacktestingRuns } from '../../../modules/actions/ModuleSubscribeToBacktestingRuns';
import { ModuleSubscribeToBacktestingTask } from '../../../modules/actions/ModuleSubscribeToBacktestingTask';
import { ModuleSubscribeToBacktestingTaskIndicators } from '../../../modules/actions/ModuleSubscribeToBacktestingTaskIndicators';
import { ModuleSubscribeToRouterParams } from '../../../modules/actions/ModuleSubscribeToRouterParams';

export type TTableBacktestingRunsItem = TBacktestingRun & {
    progress: number;
    socket: Nil | TSocketName;
    scores: Nil | Record<TIndicator['name'], Nil | number>;
    endTime: Nil | NanoDate;
    elapsedTime: Nil | NanoDate;
    buildInfo: Nil | Pick<TBacktestingRunBuildInfoSnapshotNode, 'core' | 'nodeNo' | 'launchNo'>;
};

export function useBacktestingRunItems(props: {
    indicatorNames: TIndicator['name'][];
    traceId: TraceId;
}): TComponentValueDescriptor<TTableBacktestingRunsItem[]> {
    const items$ = useModule(ModuleSubscribeToCurrentBacktestingRunItems);
    return useNotifiedValueDescriptorObservable(
        items$(props.indicatorNames, { traceId: props.traceId }),
    );
}

const ModuleSubscribeToCurrentBacktestingRunItems = ModuleFactory((ctx) => {
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToBacktestingTask = ModuleSubscribeToBacktestingTask(ctx);
    const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);
    const fetchBacktestingRunsBuildInfo = ModuleFetchBacktestingRunsBuildInfo(ctx);
    const subscribeToBacktestingTaskIndicators = ModuleSubscribeToBacktestingTaskIndicators(ctx);

    return dedobs(
        (
            indicatorNames: Nil | TIndicator['name'][],
            { traceId }: TWithTraceId,
        ): Observable<TValueDescriptor2<TTableBacktestingRunsItem[]>> =>
            subscribeToRouterParams(['stage', 'url', 'taskId']).pipe(
                switchMap((params) => {
                    const { url, stage, taskId } = params;

                    if (isNil(stage) || isNil(url) || isNil(taskId)) {
                        return of(WAITING_VD);
                    }

                    const task$ = subscribeToBacktestingTask(
                        {
                            target: url,
                            taskId: taskId,
                        },
                        { traceId },
                    );
                    const runs$ = subscribeToBacktestingRuns(
                        {
                            target: url,
                            taskId: taskId,
                        },
                        { traceId },
                    );
                    const buildInfo$ = runs$.pipe(
                        switchMapValueDescriptor(
                            ({
                                value: runs,
                            }): Observable<TValueDescriptor2<TBacktestingRunBuildInfoSnapshot[]>> =>
                                fetchBacktestingRunsBuildInfo(
                                    { target: url, btRuns: runs },
                                    { traceId },
                                ),
                        ),
                    );

                    const indicators$ = isNil(indicatorNames)
                        ? of(createSyncedValueDescriptor(null))
                        : subscribeToBacktestingTaskIndicators(
                              url,
                              taskId,
                              indicatorNames,
                              traceId,
                          );

                    return combineLatest({
                        task: task$,
                        runs: runs$,
                        buildInfo: buildInfo$,
                        indicators: indicators$,
                    }).pipe(
                        map(({ task, runs, buildInfo, indicators }) => {
                            if (isSyncedValueDescriptor(task) && isSyncedValueDescriptor(runs)) {
                                return createSyncedValueDescriptor(
                                    runs.value.map((run) =>
                                        createItem(
                                            stage,
                                            task.value,
                                            run,
                                            indicators.value,
                                            buildInfo.value,
                                        ),
                                    ),
                                );
                            } else {
                                return (
                                    findWorstUnsyncedValueDescriptor([
                                        task,
                                        runs,
                                        indicators,
                                        buildInfo,
                                    ]) ?? REQUESTING_VD
                                );
                            }
                        }),
                    );
                }),
            ),
        {
            normalize: ([indicatorName]) => indicatorName?.join('') ?? constantNormalizer(),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});

function createItem(
    stage: TSocketName,
    task: TBacktestingTask,
    run: TBacktestingRun,
    indicators: Nil | Record<TBacktestingRunId, Record<TIndicator['name'], TIndicator | undefined>>,
    buildInfo: Nil | TBacktestingRunBuildInfoSnapshot[],
): TTableBacktestingRunsItem {
    const nowMs = getNowMilliseconds();

    const simStartTime = run.simulationStartTime ?? task.simulationData.startTime;
    const simEndTime = run.simulationEndTime ?? task.simulationData.endTime;

    const simDuration = iso2milliseconds(simEndTime) - iso2milliseconds(simStartTime);
    const onePercent = simDuration / 100;

    const progress =
        (iso2milliseconds(run.simulationTime) - iso2milliseconds(simStartTime)) / onePercent;

    let realEndTime: NanoDate | undefined;
    switch (run.status) {
        case EBacktestingRunStatus.Running: {
            realEndTime =
                run.speed > 0
                    ? new NanoDate(plus(nowMs, (1 - progress / 100) * (simDuration / run.speed)))
                    : undefined;
            break;
        }
        case EBacktestingRunStatus.Succeed: {
            realEndTime = iso2NanoDate(run.realCurrentTime);
        }
    }

    const realElapsedTime = new NanoDate(
        minus(iso2milliseconds(run.realCurrentTime), iso2milliseconds(run.realStartTime)),
    );

    return {
        ...run,
        socket: stage,
        scores: mapValues(indicators?.[run.btRunNo], 'value'),
        progress,
        endTime: realEndTime,
        elapsedTime: realElapsedTime,
        buildInfo: buildInfo?.find((item) => item.btRunNo === run.btRunNo)?.nodes?.[0],
    };
}

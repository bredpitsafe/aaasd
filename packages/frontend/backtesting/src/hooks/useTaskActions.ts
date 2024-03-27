import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import {
    useNotifiedObservableFunction,
    useObservableFunction,
} from '@frontend/common/src/utils/React/useObservableFunction';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { iso2milliseconds } from '@frontend/common/src/utils/time';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEqual, isNil, pick } from 'lodash-es';
import { EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, switchMap, tap } from 'rxjs/operators';

import type { TFormBacktestingTask } from '../components/Forms/FormCreateBacktestingTask/defs';
import { EBacktestingRoute } from '../defs/router';
import { ModuleBacktestingTaskConfigs } from '../modules/actions/ModuleBacktestingTaskConfigs';
import { ModuleCreateAndStartBacktestingTask } from '../modules/actions/ModuleCreateAndStartBacktestingTask';
import { ModuleDeleteBacktestingTask } from '../modules/actions/ModuleDeleteBacktestingTask';
import { ModuleSetCurrentTaskId } from '../modules/actions/ModuleSetCurrentTaskId';
import { ModuleStopBacktestingTask } from '../modules/actions/ModuleStopBacktestingTask';
import { ModuleSubscribeToBacktestingTask } from '../modules/actions/ModuleSubscribeToBacktestingTask';
import { ModuleBacktestingRouter } from '../modules/router/module';
import { indicatorToIndicatorsList } from '../utils/indicators';

type TUseTaskActionsReturnType = {
    stopTask: (id: TBacktestingTask['id']) => void;
    runAgainTask: (id: TBacktestingTask['id']) => void;
    cloneTask: (id: TBacktestingTask['id']) => void;
    deleteTask: (id: TBacktestingTask['id']) => void;
};

export const useTaskActions = (): TUseTaskActionsReturnType => {
    const traceId = useTraceId();
    const { confirm } = useModule(ModuleModals);
    const setCurrentTaskId = useModule(ModuleSetCurrentTaskId);
    const { upsertTabTask } = useModule(ModuleLayouts);
    const { currentSocketUrl$, currentSocketName$ } = useModule(ModuleSocketPage);
    const subscribeToBacktestingTask = useModule(ModuleSubscribeToBacktestingTask);
    const { getBacktestingTaskConfigs } = useModule(ModuleBacktestingTaskConfigs);
    const { navigate } = useModule(ModuleBacktestingRouter);
    const deleteBacktestingTask = useModule(ModuleDeleteBacktestingTask);
    const stopBacktestingTask = useModule(ModuleStopBacktestingTask);
    const createAndStartBacktestingTask = useModule(ModuleCreateAndStartBacktestingTask);

    const [stopTask] = useNotifiedObservableFunction(
        (id: TBacktestingTask['id']) => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) => stopBacktestingTask({ target: url, id }, { traceId })),
            );
        },
        {
            getNotifyTitle: () => ({
                loading: `Stop Backtesting Task`,
                success: `Backtesting Task stopped successfully`,
            }),
        },
    );

    const [runAgainTask] = useNotifiedObservableFunction(
        (id: TBacktestingTask['id']) => {
            const traceId = generateTraceId();

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    forkJoin([
                        subscribeToBacktestingTask({ target: url, taskId: id }, { traceId }).pipe(
                            extractSyncedValueFromValueDescriptor(),
                            first(),
                        ),
                        getBacktestingTaskConfigs({ target: url, taskId: id }, { traceId }).pipe(
                            extractSyncedValueFromValueDescriptor(),
                        ),
                    ]).pipe(
                        switchMap(([task, config]) => {
                            return createAndStartBacktestingTask(
                                {
                                    target: url,
                                    name: task.name,
                                    description: task.description,
                                    simulationData: task.simulationData,
                                    backtestConfigTemplate: config.configTemplate,
                                    variablesTemplate: config.variablesTemplate,
                                    robots: config.robots,
                                    scoreIndicator: task.scoreIndicator,
                                },
                                { traceId },
                            );
                        }),
                        extractSyncedValueFromValueDescriptor(),
                        filter(
                            (result): result is TBacktestingTask['id'] =>
                                typeof result === 'number',
                        ),
                        switchMap(setCurrentTaskId),
                    ),
                ),
            );
        },
        {
            getNotifyTitle: () => ({
                loading: `Create Backtesting Task`,
                success: `Backtesting Task created successfully`,
            }),
        },
    );

    const [cloneTask] = useNotifiedObservableFunction(
        (id: TBacktestingTask['id']) => {
            const traceId = generateTraceId();

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    forkJoin([
                        subscribeToBacktestingTask({ target: url, taskId: id }, { traceId }).pipe(
                            first(isSyncedValueDescriptor),
                        ),
                        getBacktestingTaskConfigs({ target: url, taskId: id }, { traceId }).pipe(
                            first(isSyncedValueDescriptor),
                        ),
                    ]).pipe(
                        switchMap(
                            ([
                                { value: task },
                                { value: config },
                            ]): Observable<TFormBacktestingTask> =>
                                of({
                                    id: task.id,
                                    name: task.name,
                                    description: task.description,
                                    simulationData: {
                                        startTime: iso2milliseconds(task.simulationData.startTime),
                                        endTime: iso2milliseconds(task.simulationData.endTime),
                                    },
                                    configTemplate: config.configTemplate,
                                    variablesTemplate: config.variablesTemplate,
                                    robots: config.robots.map((robot) =>
                                        pick(
                                            robot,
                                            'name',
                                            'kind',
                                            'configTemplate',
                                            'attachments',
                                            'state',
                                        ),
                                    ),
                                    scoreIndicatorsList: indicatorToIndicatorsList(
                                        task.scoreIndicator,
                                    ),
                                }),
                        ),
                    ),
                ),
                distinctUntilChanged(isEqual),
                tap((task) => upsertTabTask<TFormBacktestingTask>(task)),
            );
        },
        {
            getNotifyTitle: () => ({
                loading: `Clone Backtesting Task`,
                success: `Backtesting Task cloned successfully`,
            }),
        },
    );

    const [deleteTask] = useNotifiedObservableFunction(
        (id: TBacktestingTask['id']) =>
            currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) => deleteBacktestingTask({ target: url, id }, { traceId })),
                extractSyncedValueFromValueDescriptor(),
                switchMap(() => currentSocketName$),
                first(),
                tap((socketName) =>
                    isNil(socketName)
                        ? navigate(EBacktestingRoute.Default, {})
                        : navigate(EBacktestingRoute.Stage, { socket: socketName }),
                ),
            ),
        {
            getNotifyTitle: () => ({
                loading: `Delete Backtesting Task`,
                success: `Backtesting Task deleted successfully`,
            }),
        },
    );
    const [safeDeleteTask] = useObservableFunction((id: TBacktestingTask['id']) => {
        return from(confirm(`Do you want to delete task ${id}?`)).pipe(
            switchMap((res) => {
                if (!res) return EMPTY;
                return deleteTask(id);
            }),
        );
    });

    return {
        stopTask,
        cloneTask,
        runAgainTask,
        deleteTask: safeDeleteTask,
    };
};

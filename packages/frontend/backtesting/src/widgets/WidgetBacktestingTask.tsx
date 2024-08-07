import type { TraceId } from '@common/utils';
import { validateBySchema } from '@frontend/common/src/components/Formik/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { EBacktestingTaskStatus } from '@frontend/common/src/types/domain/backtestings';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    extractSyncedValueFromValueDescriptor,
    mapValueDescriptor,
    squashValueDescriptors,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isNil, isUndefined } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { combineLatest, of } from 'rxjs';

import type {
    TFormBacktestingTask,
    TValidFormBacktestingTask,
} from '../components/Forms/FormCreateBacktestingTask/defs';
import { UPDATE_SCHEMA } from '../components/Forms/FormCreateBacktestingTask/defs';
import { compileFormDataFromTaskAndConfigs } from '../components/Forms/FormCreateBacktestingTask/utils';
import { FormCreateBacktestingTask } from '../components/Forms/FormCreateBacktestingTask/view';
import { ModuleBacktestingTaskConfigs } from '../modules/actions/ModuleBacktestingTaskConfigs';
import { ModuleSubscribeToCurrentBacktestingTask } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTask';
import { ModuleSubscribeToCurrentBacktestingTaskId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTaskId';
import { ModuleUpdateBacktestingTask } from '../modules/actions/ModuleUpdateBacktestingTask';
import { indicatorsListToIndicator } from '../utils/indicators';

export function WidgetBacktestingTask(props: TWithClassname) {
    const traceId = useTraceId();
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const updateBacktestingTask = useModule(ModuleUpdateBacktestingTask);
    const subscribeToCurrentBacktestingTaskId = useModule(
        ModuleSubscribeToCurrentBacktestingTaskId,
    );

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const taskId = useSyncObservable(subscribeToCurrentBacktestingTaskId());
    const taskWithStatus = useNotifiedValueDescriptorObservable(useTaskWithStatus(traceId));

    const [cbUpdateTask] = useNotifiedObservableFunction(
        (task: TValidFormBacktestingTask) => {
            if (isNil(socketUrl) || isUndefined(taskId)) {
                return of(undefined);
            }

            return updateBacktestingTask(
                {
                    target: socketUrl,
                    id: taskId,
                    name: task.name,
                    description: task.description,
                    scoreIndicator: indicatorsListToIndicator(task.scoreIndicatorsList),
                },
                { traceId },
            ).pipe(extractSyncedValueFromValueDescriptor());
        },
        {
            getNotifyTitle: () => `Update task ${taskId}`,
        },
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const validate = useFunction((values: TFormBacktestingTask) =>
        validateBySchema(values, UPDATE_SCHEMA),
    );

    const formTask = useDeepEqualProp(taskWithStatus.value?.formTask);

    // TODO: add case for task.meta.loadingState === true
    // TODO: add case for task.fail !== null

    return (
        <div className={cn(cnRelative, props.className)}>
            <ValueDescriptorsOverlay descriptors={[taskWithStatus]}>
                {!isNil(formTask) && (
                    <FormCreateBacktestingTask
                        className={cnFit}
                        readonly
                        task={formTask}
                        taskStatus={taskWithStatus.value?.taskStatus}
                        onSubmit={cbUpdateTask}
                        timeZone={timeZone}
                        onValidate={validate}
                    />
                )}
            </ValueDescriptorsOverlay>
        </div>
    );
}

function useTaskWithStatus(
    traceId: TraceId,
): Observable<
    TValueDescriptor2<{ formTask: TFormBacktestingTask; taskStatus: EBacktestingTaskStatus }>
> {
    const subscribeToCurrentBacktestingTask$ = useModule(ModuleSubscribeToCurrentBacktestingTask);
    const { getCurrentBacktestingTaskConfigs } = useModule(ModuleBacktestingTaskConfigs);

    return useMemo(
        () =>
            combineLatest([
                subscribeToCurrentBacktestingTask$(traceId),
                getCurrentBacktestingTaskConfigs(traceId),
            ]).pipe(
                squashValueDescriptors(),
                mapValueDescriptor(({ value: [task, config] }) => {
                    return createSyncedValueDescriptor({
                        formTask: compileFormDataFromTaskAndConfigs(task, config),
                        taskStatus: task.status,
                    });
                }),
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getCurrentBacktestingTaskConfigs, subscribeToCurrentBacktestingTask$],
    );
}

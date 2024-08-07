import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { logger } from '@frontend/common/src/utils/Tracing';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { firstValueFrom } from 'rxjs';

import { useInfinitySnapshotTasks } from '../components/Layout/hooks/useInfinitySnapshotTasks';
import { TableBacktestingTasks } from '../components/TableBacktestingTasks/view';
import { useTaskActions } from '../hooks/useTaskActions';
import { ModuleSetCurrentTaskId } from '../modules/actions/ModuleSetCurrentTaskId';
import { ModuleSubscribeToCurrentBacktestingTaskId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTaskId';

export function WidgetBacktestingTasks(props: TWithClassname): null | ReactElement {
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingTaskId = useModule(
        ModuleSubscribeToCurrentBacktestingTaskId,
    );

    const url = useSyncObservable(currentSocketUrl$);
    const taskId = useSyncObservable(subscribeToCurrentBacktestingTaskId());

    return isNil(url) ? null : (
        <BacktestingTasksWithRequiredProps {...props} url={url} taskId={taskId} />
    );
}

function BacktestingTasksWithRequiredProps(
    props: TWithClassname & { url: TSocketURL; taskId?: TBacktestingTask['id'] },
): ReactElement {
    const setCurrentTaskId = useModule(ModuleSetCurrentTaskId);

    const infinitySnapshotTasks = useInfinitySnapshotTasks(props.url);

    const handleReceiveRows = useFunction((tasks: TBacktestingTask[]) => {
        if (props.taskId === undefined && tasks.length > 0) {
            setCurrentTaskId(tasks[0].id).subscribe({
                error: logger.error.bind(logger),
            });
        }
    });

    const handleChangeBacktestingTaskId = useFunction((newTaskId: number) => {
        if (isNil(props.taskId)) {
            return;
        }

        return firstValueFrom(setCurrentTaskId(newTaskId));
    });

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const { stopTask, deleteTask, cloneTask, runAgainTask, bulkDeleteTask } = useTaskActions();

    return (
        <TableBacktestingTasks
            className={props.className}
            activeId={props.taskId}
            onChangeActiveId={handleChangeBacktestingTaskId}
            onStop={stopTask}
            onClone={cloneTask}
            onRunAgain={runAgainTask}
            onDelete={deleteTask}
            onBulkDelete={bulkDeleteTask}
            getRows={infinitySnapshotTasks.getItems$}
            onReceiveRows={handleReceiveRows}
            refreshInfiniteCacheTrigger$={infinitySnapshotTasks.updateTrigger$}
            timeZone={timeZone}
        />
    );
}

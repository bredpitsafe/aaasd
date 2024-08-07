import type { TimeZone } from '@common/types';
import { generateTraceId } from '@common/utils';
import { Error as ErrorView } from '@frontend/common/src/components/Error/view';
import { useConvertRates } from '@frontend/common/src/components/hooks/useConvertRates';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { getTraceId } from '@frontend/common/src/modules/actions/utils.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { getHerodotusVersion } from '@frontend/common/src/utils/domain/isHerodotus';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import cn from 'classnames';
import { isNil, uniq } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { TableHerodotusTasks } from '../components/TableHerodotusTasks/view';
import { BestPricesContext } from '../context/bestPricesContext';
import { ConvertRatesContext } from '../context/convertRatesContext';
import { InstrumentsLinksContext } from '../context/instrumentsLinksContext';
import { useDraftedTasks } from '../hooks/useDraftedTasks';
import { useViewTasks } from '../hooks/useViewTasks';
import { ModuleHerodotusTaskIndicators } from '../modules/ModuleHerodotusTaskIndicators.ts';
import { ModuleHerodotusTasks } from '../modules/ModuleHerodotusTasks.ts';
import { ModuleUpdateHerodotusCommandOnCurrentStage } from '../modules/ModuleUpdateHerodotusCommandOnCurrentStage.ts';
import { ModuleUpdateHerodotusTask } from '../modules/ModuleUpdateHerodotusTask.ts';
import type { THerodotusTaskView } from '../types';
import type { THerodotusTaskId } from '../types/domain';
import { EHerodotusCommands } from '../types/domain';
import { getExportFilename } from '../utils';
import { cnRoot, cnTable } from './WidgetTableHerodotusTasks.css';

export type TWidgetTableHerodotusTasksProps = TWithClassname & {
    tableId: ETableIds.ActiveTasks | ETableIds.ArchivedTasks;
    robot: TRobot;
    timeZone: TimeZone;
    indicatorsDashboardTabId: string;
};

export function WidgetTableHerodotusTasks({
    tableId,
    robot,
    className,
    timeZone,
    indicatorsDashboardTabId,
}: TWidgetTableHerodotusTasksProps): ReactElement | null {
    const updateHerodotusTask = useModule(ModuleUpdateHerodotusTask);
    const updateHerodotusCommand = useModule(ModuleUpdateHerodotusCommandOnCurrentStage);
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);
    const { upsertTabFrame } = useModule(ModuleLayouts);
    const { subscribeToTasksIndicators } = useModule(ModuleHerodotusTaskIndicators);
    const { getActiveTasksList, getArchivedTasksList } = useModule(ModuleHerodotusTasks);

    const socketName = useSyncObservable(currentSocketName$);
    const socketURL = useSyncObservable(currentSocketUrl$);
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments(undefined, { traceId: generateTraceId() }),
    );

    const getTasksList = useFunction(() => {
        const method =
            tableId === ETableIds.ActiveTasks ? getActiveTasksList : getArchivedTasksList;
        // disable retries, cause useHerodotusTaskList will transform request(getArchivedTasksList) to subscription
        return method(robot.id, generateTraceId());
    });

    const enabled = componentIsAllowed(robot.status);
    const tasks = useNotifiedValueDescriptorObservable(getTasksList());

    const [cbStart] = useNotifiedObservableFunction(
        (taskId: THerodotusTaskId) =>
            updateHerodotusCommand(
                { robotId: robot.id, taskId, command: EHerodotusCommands.start },
                { traceId: generateTraceId() },
            ),
        START_OPTIONS,
    );
    const [cbPause] = useNotifiedObservableFunction(
        (taskId: THerodotusTaskId) =>
            updateHerodotusCommand(
                { robotId: robot.id, taskId, command: EHerodotusCommands.stop },
                { traceId: generateTraceId() },
            ),
        PAUSE_OPTIONS,
    );
    const [cbDelete] = useNotifiedObservableFunction(
        (taskId: THerodotusTaskId) =>
            updateHerodotusCommand(
                { robotId: robot.id, taskId, command: EHerodotusCommands.delete },
                { traceId: generateTraceId() },
            ),
        DELETE_OPTIONS,
    );
    const [cbArchive] = useNotifiedObservableFunction(
        (taskId: THerodotusTaskId) =>
            updateHerodotusCommand(
                { robotId: robot.id, taskId, command: EHerodotusCommands.archive },
                { traceId: generateTraceId() },
            ),
        ARCHIVE_OPTIONS,
    );

    const [cbClone] = useNotifiedObservableFunction(
        (taskId: THerodotusTaskId) =>
            updateHerodotusCommand(
                { robotId: robot.id, taskId, command: EHerodotusCommands.clone },
                { traceId: generateTraceId() },
            ),
        CLONE_OPTIONS,
    );

    const convertRates = useConvertRates(
        useMemo(
            () =>
                !isNil(tasks) && !isNil(tasks.value)
                    ? uniq(tasks.value.map(({ asset }) => asset).sort())
                    : (EMPTY_ARRAY as TAsset['name'][]),
            [tasks],
        ),
    );

    const instrumentsLinksMap = useMemo(() => {
        if (isNil(instruments.value)) {
            return;
        }

        const instrumentsMap = new Map<string, string>();
        instruments.value.map((inst) => {
            if (isNil(inst.href)) {
                return;
            }
            instrumentsMap.set(`${inst.name}|${inst.exchange}`, inst.href);
        });
        return instrumentsMap;
    }, [instruments.value]);

    const bestPricesMap = useNotifiedValueDescriptorObservable(
        isNil(socketURL) ? EMPTY : subscribeToTasksIndicators(socketURL, robot.id, getTraceId()),
    );

    const version = useMemo(() => getHerodotusVersion(robot.kind), [robot.kind]);

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(indicatorsDashboardTabId, name, url);
    });

    const [cbSaveTask] = useNotifiedObservableFunction((task: THerodotusTaskView) => {
        return updateHerodotusTask({ robot, task }, { traceId: generateTraceId() });
    }, SAVE_TASK_OPTIONS);

    const viewTasks = useViewTasks(tasks?.value ?? undefined, robot.id);
    const {
        tasks: viewTasksWithDraft,
        onSave,
        onReset,
        onRequestTaskEdit,
        onRequestInstrumentEdit,
    } = useDraftedTasks(viewTasks, cbSaveTask);

    if (!socketName) {
        return null;
    }

    const exportFilename = getExportFilename('Herodotus_active_tasks', {
        socket: socketName,
        robot: robot.name,
    });

    return (
        <div className={cn(cnRoot, className)}>
            {enabled ? (
                <ConvertRatesContext.Provider value={convertRates}>
                    <BestPricesContext.Provider value={bestPricesMap.value}>
                        <InstrumentsLinksContext.Provider value={instrumentsLinksMap}>
                            <TableHerodotusTasks
                                tableId={tableId}
                                className={cnTable}
                                exportFilename={exportFilename}
                                items={viewTasksWithDraft}
                                socketName={socketName}
                                version={version}
                                onStart={cbStart}
                                onPause={cbPause}
                                onDelete={cbDelete}
                                onArchive={cbArchive}
                                onCellEditRequestTask={onRequestTaskEdit}
                                onCellEditRequestInstrument={onRequestInstrumentEdit}
                                onClone={cbClone}
                                onDashboardLinkClick={cbDashboardLinkClick}
                                onSave={onSave}
                                onReset={onReset}
                                timeZone={timeZone}
                            />
                        </InstrumentsLinksContext.Provider>
                    </BestPricesContext.Provider>
                </ConvertRatesContext.Provider>
            ) : (
                <ErrorView status="warning" title="Robot is disabled">
                    Start robot to view active tasks
                </ErrorView>
            )}
        </div>
    );
}

const SAVE_TASK_OPTIONS = {
    getNotifyTitle: (task: { taskId: THerodotusTaskId }) => ({
        loading: `Saving task "${task.taskId}"...`,
        success: `Task "${task.taskId}" has been saved`,
    }),
};
const START_OPTIONS = {
    getNotifyTitle: (id: THerodotusTaskId) => ({
        loading: `Starting task "${id}"...`,
        success: `Task "${id}" has been started`,
    }),
};
const PAUSE_OPTIONS = {
    getNotifyTitle: (id: THerodotusTaskId) => ({
        loading: `Pausing task "${id}"...`,
        success: `Task "${id}" has been paused`,
    }),
};
const DELETE_OPTIONS = {
    getNotifyTitle: (id: THerodotusTaskId) => ({
        loading: `Deleting task "${id}"...`,
        success: `Task "${id}" has been deleted`,
    }),
};
const ARCHIVE_OPTIONS = {
    getNotifyTitle: (id: THerodotusTaskId) => ({
        loading: `Archiving task "${id}"...`,
        success: `Task "${id}" has been archived`,
    }),
};
const CLONE_OPTIONS = {
    getNotifyTitle: (id: THerodotusTaskId) => ({
        loading: `Cloning task "${id}"...`,
        success: `Task "${id}" has been cloned`,
    }),
};

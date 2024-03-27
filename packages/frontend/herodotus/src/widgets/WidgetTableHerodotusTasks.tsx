import { Error as ErrorView } from '@frontend/common/src/components/Error/view';
import { useConvertRates } from '@frontend/common/src/components/hooks/useConvertRates';
import { useModule } from '@frontend/common/src/di/react';
import { getTraceId } from '@frontend/common/src/handlers/utils';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TimeZone } from '@frontend/common/src/types/time';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { getHerodotusVersion } from '@frontend/common/src/utils/domain/isHerodotus';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import cn from 'classnames';
import { isNil, uniq } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { EMPTY, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableHerodotusTasks } from '../components/TableHerodotusTasks/view';
import { BestPricesContext } from '../context/bestPricesContext';
import { ConvertRatesContext } from '../context/convertRatesContext';
import { InstrumentsLinksContext } from '../context/instrumentsLinksContext';
import { useDraftedTasks } from '../hooks/useDraftedTasks';
import { useViewTasks } from '../hooks/useViewTasks';
import { ModuleHerodotusCommand } from '../modules/herodotusCommand';
import { ModuleHerodotusTaskActions } from '../modules/herodotusTaskActions';
import { ModuleHerodotusTaskIndicators } from '../modules/herodotusTaskIndicators';
import { ModuleHerodotusTasks } from '../modules/herodotusTasks';
import { THerodotusTaskView } from '../types';
import { EHerodotusCommands, THerodotusTaskId } from '../types/domain';
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
    const traceId = generateTraceId();
    const { getSocketInstrumentsDedobsed$ } = useModule(ModuleBaseActions);
    const { sendHerodotusCommand } = useModule(ModuleHerodotusCommand);

    const { updateHerodotusTask } = useModule(ModuleHerodotusTaskActions);
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleCommunication);
    const { upsertTabFrame } = useModule(ModuleLayouts);
    const { subscribeToTasksIndicators } = useModule(ModuleHerodotusTaskIndicators);

    const socketName = useSyncObservable(currentSocketName$);
    const socketURL = useSyncObservable(currentSocketUrl$);

    const { getActiveTasksList, getArchivedTasksList } = useModule(ModuleHerodotusTasks);

    const getTasksList = useFunction(() => {
        const method =
            tableId === ETableIds.ActiveTasks ? getActiveTasksList : getArchivedTasksList;
        // disable retries, cause useHerodotusTaskList will transform request(getArchivedTasksList) to subscription
        return method(robot.id, traceId);
    });

    const enabled = componentIsAllowed(robot.status);
    const tasks = useValueDescriptorObservableDeprecated(getTasksList());

    const cbStart = useFunction((taskId: THerodotusTaskId) =>
        firstValueFrom(sendHerodotusCommand(robot.id, taskId, EHerodotusCommands.start)),
    );
    const cbPause = useFunction((taskId: THerodotusTaskId) =>
        firstValueFrom(sendHerodotusCommand(robot.id, taskId, EHerodotusCommands.stop)),
    );
    const cbDelete = useFunction(async (taskId: THerodotusTaskId) =>
        firstValueFrom(sendHerodotusCommand(robot.id, taskId, EHerodotusCommands.delete)),
    );
    const cbArchive = useFunction(async (taskId: THerodotusTaskId) =>
        firstValueFrom(sendHerodotusCommand(robot.id, taskId, EHerodotusCommands.archive)),
    );

    const cbClone = useFunction(async (taskId: THerodotusTaskId) => {
        await firstValueFrom(sendHerodotusCommand(robot.id, taskId, EHerodotusCommands.clone));
    });

    const convertRates = useConvertRates(
        useMemo(
            () =>
                !isNil(tasks) && !isNil(tasks.value)
                    ? uniq(tasks.value.map(({ asset }) => asset).sort())
                    : (EMPTY_ARRAY as TAsset['name'][]),
            [tasks],
        ),
    );

    // Only load instruments after the tasks are loaded,
    // since instruments are only required to create URLs in nested tables
    const instrumentsLinksMap$ = useMemo(() => {
        return getSocketInstrumentsDedobsed$().pipe(
            map((instruments) => {
                if (isNil(instruments)) {
                    return;
                }

                const instrumentsMap = new Map<string, string>();
                instruments.map((inst) => {
                    if (isNil(inst.href)) {
                        return;
                    }
                    instrumentsMap.set(`${inst.name}|${inst.exchange}`, inst.href);
                });
                return instrumentsMap;
            }),
        );
    }, [getSocketInstrumentsDedobsed$]);

    const instrumentsLinksMap = useSyncObservable(isSyncDesc(tasks) ? instrumentsLinksMap$ : EMPTY);

    const bestPricesMap$ = subscribeToTasksIndicators(socketURL!, robot.id, getTraceId());
    const bestPricesMap = useSyncObservable(bestPricesMap$);

    const version = useMemo(() => getHerodotusVersion(robot.kind), [robot.kind]);

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(indicatorsDashboardTabId, name, url);
    });

    const cbSaveTask = useFunction(async (task: THerodotusTaskView) => {
        return firstValueFrom(updateHerodotusTask(robot, task));
    });

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
                    <BestPricesContext.Provider value={bestPricesMap}>
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

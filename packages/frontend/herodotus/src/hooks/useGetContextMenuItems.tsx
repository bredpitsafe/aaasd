import type { TimeZone } from '@common/types';
import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import {
    getHeroTabName,
    getHeroTradesURL,
    getRobotDashboardURL,
} from '@frontend/common/src/utils/urlBuilders';
import { isEmpty, isFunction, isNil, isString } from 'lodash-es';

import type { THerodotusTaskView } from '../types';
import type { THerodotusTaskId } from '../types/domain';
import { EHerodotusTaskStatus } from '../types/domain';
import { getFormData } from '../utils/getFormData';

type TUseContextMenuItemsProps = {
    timeZone: TimeZone;
    socketName: TSocketName;
    onStart?: (taskId: THerodotusTaskId) => void;
    onPause?: (taskId: THerodotusTaskId) => void;
    onArchive?: (taskId: THerodotusTaskId) => void;
    onClone?: (taskId: THerodotusTaskId) => void;
    onDelete?: (taskId: THerodotusTaskId) => void;
};

type TParams = GetContextMenuItemsParams<THerodotusTaskView>;

const svgPause = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/pause.svg') as string,
);

const svgStart = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/caret-right.svg') as string,
);

const svgCopy = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/copy.svg') as string,
);

const svgForm = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/form.svg') as string,
);

const svgArchive = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/inbox.svg') as string,
);

const svgDelete = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/delete.svg') as string,
);

const svgCharts = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/line-chart.svg') as string,
);

const svgTable = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/table.svg') as string,
);

const svgNewWindow = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/link.svg') as string,
);
export function useGetContextMenuItems(
    props: TUseContextMenuItemsProps,
): GridOptions['getContextMenuItems'] {
    return useActionsFactory(props);
}

function useActionsFactory(props: TUseContextMenuItemsProps) {
    const { upsertTabFrame, upsertTabTask } = useModule(ModuleLayouts);
    const { confirm } = useModule(ModuleModals);

    return function getActions(params: TParams): (string | MenuItemDef)[] {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];
        const { onArchive, onStart, onPause, onDelete, onClone } = props;

        if (data === undefined) return actions;

        const startAction = startTasksAction.bind(null, params, confirm);

        const name = getHeroTabName({
            taskId: data.taskId,
            taskType: data.taskType,
            amount: data.amountView ?? 0,
            asset: data.asset,
        });

        // "Start task" action
        if (isFunction(onStart) && data.status === EHerodotusTaskStatus.paused) {
            actions.push({
                icon: svgStart,
                name: 'Start',
                action: () => startAction(onStart, data.taskId),
            });
        }

        // "Pause task" action
        if (isFunction(onPause) && data.status === EHerodotusTaskStatus.started) {
            actions.push({
                icon: svgPause,
                name: 'Pause',
                action: () => startAction(onPause, data.taskId),
            });
        }

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        // "Archive task" action
        if (isFunction(onArchive)) {
            actions.push({
                icon: svgArchive,
                name: 'Archive',
                action: () => startAction(onArchive, data.taskId, 'Do you want to archive tasks'),
                disabled: data.status === EHerodotusTaskStatus.started,
                tooltip:
                    data.status === EHerodotusTaskStatus.started
                        ? 'Started task cannot be archived'
                        : undefined,
            });
        }

        // "Delete task" action
        if (isFunction(onDelete)) {
            actions.push({
                icon: svgDelete,
                name: 'Delete',
                action: () => startAction(onDelete, data.taskId, 'Do you want to delete tasks'),
                disabled: data.filledAmount !== 0,
            });
        }

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        // "Clone task" action
        if (isFunction(onClone)) {
            actions.push({
                icon: svgCopy,
                name: 'Clone',
                action: () => startAction(onClone, data.taskId, 'Do you want to clone tasks'),
            });
        }

        // "Fill from this" action

        actions.push({
            icon: svgForm,
            name: 'Fill form from this task',
            action: () => upsertTabTask(getFormData(data)),
        });

        actions.push(EDefaultContextMenuItemName.Separator);

        // "View Charts" action
        if (!isNil(data.dashboardName)) {
            const chartsUrl = getRobotDashboardURL({
                socket: props.socketName,
                focusTo: data.lastChangedTs,
                robotId: data.robotId,
                dashboard: data.dashboardName,
            });

            actions.push({
                icon: svgCharts,
                name: 'Charts',
                action: upsertTabFrame.bind(null, 'Charts', name, chartsUrl),
            });

            actions.push({
                icon: svgNewWindow,
                name: 'Charts (new window)',
                action: window.open.bind(null, chartsUrl),
            });
        }

        actions.push(EDefaultContextMenuItemName.Separator);

        // "View Trades" action
        const tradesUrl = getHeroTradesURL({
            socket: props.socketName,
            robotId: data.robotId,
            taskId: data.taskId,
            name,
            timeZone: props.timeZone,
        });

        actions.push({
            icon: svgTable,
            name: 'Trades',
            action: upsertTabFrame.bind(null, 'Trades', name, tradesUrl),
        });

        actions.push({
            icon: svgNewWindow,
            name: 'Trades (new window)',
            action: window.open.bind(null, tradesUrl),
        });

        actions.push(EDefaultContextMenuItemName.Separator);

        return actions;
    };
}

async function startTasksAction(
    params: TParams,
    confirm: (m: string) => Promise<boolean>,
    action: (id: THerodotusTaskId) => void,
    taskId: THerodotusTaskId,
    message?: string,
) {
    const selectedIds = params.api.getSelectedRows().map((t) => t.taskId);
    let ids: THerodotusTaskId[] = [taskId];

    if (!isEmpty(selectedIds) && selectedIds.includes(taskId)) {
        ids = selectedIds;
    }
    if (isString(message) ? await confirm(`${message}(ids: ${ids.join(', ')})?`) : true) {
        return Promise.all(ids.map((id) => action(id)));
    }
}

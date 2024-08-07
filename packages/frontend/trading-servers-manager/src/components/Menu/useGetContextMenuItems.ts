import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import type { GetContextMenuItemsParams, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleRemoveComponent } from '@frontend/common/src/modules/actions/components/ModuleRemoveComponent.ts';
import {
    ModuleRestartComponent,
    ModuleStartComponent,
    ModuleStopComponent,
    ModuleUnblockRobot,
} from '@frontend/common/src/modules/actions/components/сomponentCommands.ts';
import type { TWithTraceId } from '@frontend/common/src/modules/actions/def.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EComponentStatus, EComponentType } from '@frontend/common/src/types/domain/component';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isProdEnvironment } from '@frontend/common/src/utils/url';

import { useRouteParams } from '../../hooks/useRouteParams';
import { ModuleConfirmProdAction$ } from '../../modules/actions/ModuleConfirmProdAction$.ts';
import {
    ETradingServersManagerRouteParams,
    ETradingServersManagerRoutes,
} from '../../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../../modules/router/module';
import type { TComponentDataType } from './Components/view';
import { cnProdHighlight } from './style.css';

const svgStart = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/play-circle.svg') as string,
);
const svgStop = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/stop.svg') as string,
);
const svgRestart = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/retweet.svg') as string,
);
const svgUnblock = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/right-square.svg') as string,
);
const svgRemove = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/delete.svg') as string,
);

type TUseContextMenuItemsProps = {
    allowStart?: boolean;
    allowStop?: boolean;
    allowRestart?: boolean;
    allowUnblock?: boolean;
    allowRemove?: boolean;
};

type TParams = GetContextMenuItemsParams<TComponentDataType>;

const START_COMPONENT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Starting component...',
        success: 'Component started successfully',
    }),
};
const STOP_COMPONENT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Stopping component...',
        success: 'Component stopped successfully',
    }),
};
const RESTART_COMPONENT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Restarting component...',
        success: 'Component restarted successfully',
    }),
};
const UNBLOCK_ROBOT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Unblocking robot...',
        success: 'Robot unblocked successfully',
    }),
};
const REMOVE_COMPONENT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Removing component...',
        success: 'Component removed successfully',
    }),
};

export function useGetContextMenuItems(props?: TUseContextMenuItemsProps) {
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const confirmProdAction$ = useModule(ModuleConfirmProdAction$);
    const { confirm, confirmWithInput } = useModule(ModuleModals);

    const [startComponent] = useNotifiedObservableFunction(
        useModule(ModuleStartComponent),
        START_COMPONENT_OPTIONS,
    );
    const [stopComponent] = useNotifiedObservableFunction(
        useModule(ModuleStopComponent),
        STOP_COMPONENT_OPTIONS,
    );
    const [restartComponent] = useNotifiedObservableFunction(
        useModule(ModuleRestartComponent),
        RESTART_COMPONENT_OPTIONS,
    );
    const [unblockRobot] = useNotifiedObservableFunction(
        useModule(ModuleUnblockRobot),
        UNBLOCK_ROBOT_OPTIONS,
    );
    const [removeComponent] = useNotifiedObservableFunction(
        useModule(ModuleRemoveComponent),
        REMOVE_COMPONENT_OPTIONS,
    );

    const params = useRouteParams();
    const socket = useSyncObservable(currentSocketStruct$);
    const isProd = isProdEnvironment(socket?.name);
    const needConfirm = useSyncObservable(confirmProdAction$);

    const confirmAction = useFunction(
        async (
            action: string,
            data: TComponentDataType,
            shouldConfirm = needConfirm,
            withInput = false,
        ) => {
            if (shouldConfirm) {
                const content = `Do you want to ${action.toLowerCase()} ${data.type} "${data.id}:${
                    data.kind
                }:${data.name}"?`;
                const title = 'Unsafe action';

                return withInput
                    ? confirmWithInput(content, data.name, { title })
                    : confirm(content, { title });
            }
            return true;
        },
    );

    const makeAction = useFunction(
        async (
            name: string,
            data: TComponentDataType,
            cb: (
                params: {
                    id: TComponentDataType['id'];
                    type: TComponentDataType['type'];
                },
                options: TWithTraceId,
            ) => Promise<unknown>,
            shouldConfirm = needConfirm,
            withInput = false,
        ) => {
            if (!(await confirmAction(name, data, shouldConfirm, withInput))) {
                return;
            }

            return cb({ id: data.id, type: data.type }, { traceId: generateTraceId() });
        },
    );

    const remove = useFunction(async (name: string, data: TComponentDataType) => {
        await makeAction(
            'Remove component',
            data,
            () => {
                assert(socket !== undefined, 'socket is undefined');
                return removeComponent(
                    { target: socket, id: data.id },
                    { traceId: generateTraceId() },
                );
            },
            true,
            true,
        );
        await navigate(
            ETradingServersManagerRoutes.Server,
            {
                ...params,
                [ETradingServersManagerRouteParams.Gate]: undefined,
                [ETradingServersManagerRouteParams.Robot]: undefined,
            },
            { replace: true },
        );
    });

    return function getActions(params: TParams): (string | MenuItemDef)[] {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (data === undefined) return actions;

        const cssClasses = isProd ? [cnProdHighlight] : undefined;

        const disabledStart = [EComponentStatus.Enabled, EComponentStatus.Alarming].includes(
            data.status,
        );
        // enable 'Stop' when enabled or alarming
        const disabledStop = !disabledStart;
        // enable 'Unlock' when alarming
        const disabledUnblock = data.status !== EComponentStatus.Alarming;

        if (props?.allowStart !== false) {
            actions.push({
                icon: svgStart,
                name: 'Start',
                cssClasses,
                disabled: disabledStart,
                action: () => {
                    makeAction('Start', data, startComponent);
                },
            });
        }

        if (props?.allowStop !== false) {
            actions.push({
                icon: svgStop,
                name: 'Stop',
                cssClasses,
                disabled: disabledStop,
                action: () => {
                    makeAction('Stop', data, stopComponent);
                },
            });
        }

        if (props?.allowRestart !== false) {
            actions.push({
                icon: svgRestart,
                name: 'Restart',
                cssClasses,
                disabled: disabledStart && disabledStop,
                action: () => {
                    makeAction('Restart', data, restartComponent);
                },
            });
        }

        if (data.type === EComponentType.robot && props?.allowUnblock !== false) {
            actions.push({
                icon: svgUnblock,
                name: 'Unblock',
                cssClasses,
                disabled: disabledUnblock,
                action: () => {
                    makeAction('Unblock', data, unblockRobot);
                },
            });
        }

        if (props?.allowRemove !== false) {
            actions.push(EDefaultContextMenuItemName.Separator);
            actions.push({
                icon: svgRemove,
                name: 'Remove',
                cssClasses: [cnProdHighlight],
                action: () => remove('Remove', data),
            });
        }

        return actions;
    };
}

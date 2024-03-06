import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleRemoveComponentAction } from '@frontend/common/src/modules/actions/removeComponent';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EComponentStatus, EComponentType } from '@frontend/common/src/types/domain/component';
import { assert } from '@frontend/common/src/utils/assert';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isProdEnvironment } from '@frontend/common/src/utils/url';
import type { GetContextMenuItemsParams, MenuItemDef } from 'ag-grid-community';
import { firstValueFrom, Observable } from 'rxjs';

import { useRouteParams } from '../../hooks/useRouteParams';
import { ModuleTradingServersManagerActions } from '../../modules/actions/module';
import {
    ETradingServersManagerRouteParams,
    ETradingServersManagerRoutes,
} from '../../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../../modules/router/module';
import { TComponentDataType } from './Components/view';
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

export function useGetContextMenuItems(props?: TUseContextMenuItemsProps) {
    const { navigate } = useModule(ModuleTradingServersManagerRouter);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const { stopComponent, startComponent, restartComponent, unblockRobot } =
        useModule(ModuleBaseActions);
    const removeComponent = useModule(ModuleRemoveComponentAction);
    const { confirmProdAction$ } = useModule(ModuleTradingServersManagerActions);
    const { confirm, confirmWithInput } = useModule(ModuleModals);

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
                type: TComponentDataType['type'],
                id: TComponentDataType['id'],
            ) => Observable<unknown>,
            shouldConfirm = needConfirm,
            withInput = false,
        ) => {
            if (!(await confirmAction(name, data, shouldConfirm, withInput))) {
                return;
            }

            await firstValueFrom(cb(data.type, data.id));
        },
    );

    const remove = useFunction(async (name: string, data: TComponentDataType) => {
        await makeAction(
            'Remove component',
            data,
            () => {
                assert(socket !== undefined, 'socket is undefined');
                return removeComponent(socket, { id: data.id }, { traceId: generateTraceId() });
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

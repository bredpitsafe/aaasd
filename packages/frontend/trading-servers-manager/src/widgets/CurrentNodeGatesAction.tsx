import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { EComponentCommands } from '@frontend/common/src/handlers/def';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { assertNever } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isEmpty, isUndefined } from 'lodash-es';
import { ComponentProps } from 'react';
import { useObservable } from 'react-use';
import { firstValueFrom } from 'rxjs';

import { useRouteParams } from '../hooks/useRouteParams';

const ACTION_ICON = {
    [EComponentCommands.StartComponent]: <PlayCircleOutlined />,
    [EComponentCommands.StopComponent]: <PauseCircleOutlined />,
};
const ACTION_TITLE = {
    [EComponentCommands.StartComponent]: 'Start gates group',
    [EComponentCommands.StopComponent]: 'Stop gates group',
};
const ACTION_NAME = {
    [EComponentCommands.StartComponent]: 'start',
    [EComponentCommands.StopComponent]: 'stop',
};

type ButtonProps = ComponentProps<typeof Button>;

type TProps = {
    action: EComponentCommands.StartComponent | EComponentCommands.StopComponent;
    gateType: EComponentType.mdGate | EComponentType.execGate;
    size: ButtonProps['size'];
    className?: ButtonProps['className'];
};

export function CurrentNodeGatesAction({ className, size, gateType, action }: TProps) {
    const { getServer$ } = useModule(ModuleServers);
    const { confirm } = useModule(ModuleModals);
    const { startComponent, stopComponent } = useModule(ModuleBaseActions);

    const params = useRouteParams();
    const server = useObservable(getServer$(params?.server));
    const gateIds = gateType === EComponentType.mdGate ? server?.mdGateIds : server?.execGateIds;

    const startAction = useFunction(async (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (isUndefined(gateIds)) return;
        if (
            await confirm(
                `Do you want to ${ACTION_NAME[action]} the entire group (${gateIds.length} gates)?`,
                { title: 'Unsafe action' },
            )
        ) {
            switch (action) {
                case EComponentCommands.StartComponent:
                    return await Promise.all(
                        gateIds.map((id) => firstValueFrom(startComponent(gateType, id))),
                    );
                case EComponentCommands.StopComponent:
                    return await Promise.all(
                        gateIds.map((id) => firstValueFrom(stopComponent(gateType, id))),
                    );
                default:
                    assertNever(action);
            }
        }
    });

    if (isUndefined(gateIds) || isEmpty(gateIds)) return null;

    return (
        <Button
            className={className}
            type="text"
            size={size}
            icon={ACTION_ICON[action]}
            title={ACTION_TITLE[action]}
            onClick={startAction}
        />
    );
}

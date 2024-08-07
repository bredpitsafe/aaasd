import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { generateTraceId } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import {
    ModuleStartComponent,
    ModuleStopComponent,
} from '@frontend/common/src/modules/actions/components/сomponentCommands.ts';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isEmpty, isUndefined } from 'lodash-es';
import type { ComponentProps } from 'react';

import { useCurrentServer } from '../hooks/servers.ts';

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

const COMPONENT_ACTION_OPTIONS = {
    getNotifyTitle: (params: { id: TComponentId; type: EComponentType }) => ({
        loading: `Starting ${params.type}(${params.id})`,
        success: `${params.type}(${params.id}) started`,
    }),
};

export function CurrentNodeGatesAction({ className, size, gateType, action }: TProps) {
    const { confirm } = useModule(ModuleModals);
    const server = useCurrentServer();
    const gateIds =
        gateType === EComponentType.mdGate ? server.value?.mdGateIds : server.value?.execGateIds;

    const [startComponent] = useNotifiedObservableFunction(
        useModule(ModuleStartComponent),
        COMPONENT_ACTION_OPTIONS,
    );
    const [stopComponent] = useNotifiedObservableFunction(
        useModule(ModuleStopComponent),
        COMPONENT_ACTION_OPTIONS,
    );

    const startAction = useFunction(async (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (isUndefined(gateIds)) return;
        if (
            await confirm(
                `Do you want to ${ACTION_NAME[action]} the entire group (${gateIds.length} gates)?`,
                { title: 'Unsafe action' },
            )
        ) {
            const options = { traceId: generateTraceId() };
            switch (action) {
                case EComponentCommands.StartComponent:
                    return await Promise.all(
                        gateIds.map((id) => startComponent({ id, type: gateType }, options)),
                    );
                case EComponentCommands.StopComponent:
                    return await Promise.all(
                        gateIds.map((id) => stopComponent({ id, type: gateType }, options)),
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

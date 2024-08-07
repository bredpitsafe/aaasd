import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

export enum ComponentConfigMessage {
    ModifiedByUser = 'ModifiedByUser',
    SameConfig = 'SameConfig',
}

export function useShowComponentConfigMessage(
    kind: string,
    name: string,
): (notification: ComponentConfigMessage) => void {
    const messages = useModule(ModuleMessages);

    return useFunction((notification: ComponentConfigMessage) => {
        switch (notification) {
            case ComponentConfigMessage.ModifiedByUser:
                void messages.error(
                    `Config for ${kind}(${name}) has been modified by another user`,
                );
                break;
            case ComponentConfigMessage.SameConfig:
                void messages.warning(`Same config for ${kind}(${name}) is already applied`);
                break;
        }
    });
}

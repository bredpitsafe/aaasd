import { useConnectedComponentConfig } from '@frontend/common/src/components/hooks/useConnectedComponentConfig';
import { useModule } from '@frontend/common/src/di/react';
import type { IModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import type {
    EComponentType,
    TComponentConfig,
    TComponentId,
} from '@frontend/common/src/types/domain/component';
import { getComponentPrefix } from '@frontend/common/src/utils/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useState } from 'react';
import { firstValueFrom } from 'rxjs';

import { ModuleTradingServersManagerActions } from '../modules/actions/module';

export function useUpdatableComponentConfig(
    componentType: EComponentType,
    componentId: TComponentId,
): {
    config: undefined | TComponentConfig;
    updating: boolean;
    update: (value: string, currentDigest?: string) => Promise<void>;
} {
    const { updateComponentConfig } = useModule(ModuleBaseActions);
    const { confirmProdAction$ } = useModule(ModuleTradingServersManagerActions);
    const modalsModule = useModule(ModuleModals);

    const config = useConnectedComponentConfig(componentType, componentId);

    const [updating, setUpdating] = useState<boolean>(false);

    const confirmProdAction = useSyncObservable(confirmProdAction$, true);

    const update = useFunction(async (value: string, currentDigest?: string): Promise<void> => {
        try {
            setUpdating(true);

            if (
                confirmProdAction &&
                !(await confirmAction(componentType, componentId, modalsModule))
            ) {
                return;
            }

            await firstValueFrom(
                updateComponentConfig(componentType, componentId, value ?? '', currentDigest),
            );
        } finally {
            setUpdating(false);
        }
    });

    return {
        config,
        update,
        updating,
    };
}

function confirmAction(
    componentType: EComponentType,
    componentId: TComponentId,
    { confirm }: IModuleModals,
): Promise<boolean> {
    const componentPrefix = getComponentPrefix(componentType);
    const content = `Do you want to update ${componentPrefix} (id: ${componentId}) configuration?`;
    const title = 'Unsafe action';

    return confirm(content, { title });
}

import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import type { IModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleSubscribeToComponentConfigSnapshotOnCurrentStage } from '@frontend/common/src/modules/actions/config/ModuleSubscribeToComponentConfigSnapshotOnCurrentStage.ts';
import { ModuleUpdateComponentConfigOnCurrentStage } from '@frontend/common/src/modules/actions/config/ModuleUpdateComponentConfigOnCurrentStage.ts';
import type {
    EComponentType,
    TClientComponentConfig,
    TComponentId,
} from '@frontend/common/src/types/domain/component';
import { getComponentPrefix } from '@frontend/common/src/utils/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleConfirmProdAction$ } from '../modules/actions/ModuleConfirmProdAction$.ts';

export function useUpdatableComponentConfig(
    componentType: EComponentType,
    componentId: TComponentId,
): {
    config: Nil | TClientComponentConfig;
    updating: boolean;
    update: (value: string, currentDigest?: string) => Promise<void>;
} {
    const modalsModule = useModule(ModuleModals);
    const confirmProdAction$ = useModule(ModuleConfirmProdAction$);
    const subscribeToComponentsConfigs = useModule(
        ModuleSubscribeToComponentConfigSnapshotOnCurrentStage,
    );

    const componentTitle = `${getComponentPrefix(componentType)}(${componentId})`;
    const [updateComponentConfig, updatingComponentConfig] = useNotifiedObservableFunction(
        useModule(ModuleUpdateComponentConfigOnCurrentStage),
        {
            getNotifyTitle: () => ({
                loading: `Updating config for ${componentTitle}...`,
                success: `Config for ${componentTitle} updated`,
            }),
        },
    );

    const config = useValueDescriptorObservable(
        subscribeToComponentsConfigs(
            { componentId, lastDigest: null },
            { traceId: generateTraceId() },
        ),
    );

    const confirmProdAction = useSyncObservable(confirmProdAction$, true);

    const update = useFunction(async (value: string, currentDigest?: string): Promise<void> => {
        if (confirmProdAction && !(await confirmAction(componentType, componentId, modalsModule))) {
            return;
        }

        await updateComponentConfig(
            {
                id: componentId,
                newConfigRaw: value ?? '',
                currentDigest: currentDigest,
            },
            { traceId: generateTraceId() },
        );
    });

    return {
        config: config?.value,
        update,
        updating: isLoadingValueDescriptor(updatingComponentConfig),
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

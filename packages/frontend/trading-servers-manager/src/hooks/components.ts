import { useModule } from '@frontend/common/src/di/react.tsx';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleSubscribeToCurrentComponent } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponent.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import type {
    EComponentType,
    TComponentTypeToTypeId,
} from '@frontend/common/src/types/domain/component.ts';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

export function useComponents() {
    const traceId = useTraceId();
    const subscribe = useModule(ModuleSubscribeToCurrentComponentsSnapshot);

    return useValueDescriptorObservable(subscribe(undefined, { traceId }));
}

/**
 * @public
 */
export function useComponent<T extends EComponentType, ID extends TComponentTypeToTypeId[T]>(
    type: T,
    id: ID,
) {
    const traceId = useTraceId();
    const subscribeToComponent = useModule(ModuleSubscribeToCurrentComponent);
    return useValueDescriptorObservable(subscribeToComponent({ type, id }, { traceId }));
}

import type { Observable } from 'rxjs';

import { ComponentMetadataType } from '../../../modules/componentMetadata';
import type {
    ComponentTabKey,
    TComponentScrollPosition,
    TScrollData,
} from '../../../types/componentMetadata';
import type { EComponentType, TComponentId } from '../../../types/domain/component';
import { useComponentTabMetadata } from './useComponentTabMetadata';

export function useScrollPosition(
    componentType: EComponentType,
    componentId: TComponentId,
    componentTabKey: ComponentTabKey,
): [(value?: TScrollData) => void, () => TScrollData | undefined, Observable<TScrollData>] {
    return useComponentTabMetadata<TComponentScrollPosition>(
        ComponentMetadataType.ScrollPosition,
        componentType,
        componentId,
        componentTabKey,
    );
}

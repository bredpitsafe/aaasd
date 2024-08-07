import { ComponentMetadataType } from '../../../modules/componentMetadata';
import type {
    ComponentTabKey,
    IDraftValueWithDigest,
    TComponentDrafts,
} from '../../../types/componentMetadata';
import type { EComponentType, TComponentId } from '../../../types/domain/component';
import type { TComponentTabMetadata } from './useComponentTabMetadata';
import { useComponentTabMetadata } from './useComponentTabMetadata';

export function useDraft(
    componentType: EComponentType,
    componentId: TComponentId,
    componentTabKey: ComponentTabKey,
): TComponentTabMetadata<string> {
    return useComponentTabMetadata<TComponentDrafts<string>>(
        ComponentMetadataType.Drafts,
        componentType,
        componentId,
        componentTabKey,
    );
}

export function useDraftWithDigest(
    componentType: EComponentType,
    componentId: TComponentId,
    componentTabKey: ComponentTabKey,
): TComponentTabMetadata<IDraftValueWithDigest> {
    return useComponentTabMetadata<TComponentDrafts<IDraftValueWithDigest>>(
        ComponentMetadataType.Drafts,
        componentType,
        componentId,
        componentTabKey,
    );
}

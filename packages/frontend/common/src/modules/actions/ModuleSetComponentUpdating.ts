import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import type { EComponentType, TComponentId } from '../../types/domain/component';
import { ComponentMetadataType, ModuleComponentMetadata } from '../componentMetadata';

export const ModuleSetComponentUpdating = ModuleFactory((ctx: TContextRef) => {
    const { setComponentMetadata, deleteComponentMetadata } = ModuleComponentMetadata(ctx);

    return (componentType: EComponentType, id: TComponentId) => {
        setComponentMetadata(ComponentMetadataType.Updating, componentType, id, true);

        return () => {
            deleteComponentMetadata(ComponentMetadataType.Updating, componentType, id);
        };
    };
});

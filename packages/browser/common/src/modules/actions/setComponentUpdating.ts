import type { noop } from 'lodash-es';

import { TContextRef } from '../../di';
import type { EComponentType, TComponentId } from '../../types/domain/component';
import { ComponentMetadataType, ModuleComponentMetadata } from '../componentMetadata';
import { ModuleMessages } from '../messages';

export function setComponentUpdating(
    ctx: TContextRef,
    componentType: EComponentType,
    id: TComponentId,
    loadingMessage?: string,
): typeof noop {
    const { setComponentMetadata, deleteComponentMetadata } = ModuleComponentMetadata(ctx);
    const { loading } = ModuleMessages(ctx);
    const closeMsg = loading(loadingMessage, 0);

    setComponentMetadata(ComponentMetadataType.Updating, componentType, id, true);

    return () => {
        closeMsg();
        deleteComponentMetadata(ComponentMetadataType.Updating, componentType, id);
    };
}

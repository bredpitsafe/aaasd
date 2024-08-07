import type { Milliseconds } from '@common/types';
import { useMemo } from 'react';
import { useObservable } from 'react-use';

import { useModule } from '../../../di/react';
import { ComponentMetadataType, ModuleComponentMetadata } from '../../../modules/componentMetadata';
import type { EComponentType, TComponentId } from '../../../types/domain/component';

export type TStatusMessage = {
    componentId: TComponentId;
    message: string;
    timestamp: Milliseconds;
};

type TUseStatusMessageHistoryReturnType = TStatusMessage[];

export function useStatusMessageHistory(
    componentType: EComponentType,
    componentId: TComponentId,
): TUseStatusMessageHistoryReturnType {
    const { getComponentMetadata$ } = useModule(ModuleComponentMetadata);

    const history$ = useMemo(
        () =>
            getComponentMetadata$<TStatusMessage[]>(
                ComponentMetadataType.StatusMessageHistory,
                componentType,
                componentId,
            ),
        [getComponentMetadata$, componentType, componentId],
    );

    return useObservable(history$) || [];
}

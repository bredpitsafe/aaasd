import { useComponentTabMetadata } from '@frontend/common/src/components/hooks/components/useComponentTabMetadata';
import { ComponentMetadataType } from '@frontend/common/src/modules/componentMetadata';
import type { TComponentDrafts } from '@frontend/common/src/types/componentMetadata';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import type { TComponent } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { isGate } from '@frontend/common/src/utils/domain/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { useEffectOnce } from 'react-use';

export function useConfigDigest(
    component: TComponent,
    configDigest: string | undefined,
    routerConfigDigest: string | undefined,
): [string | undefined, boolean, (digest: string | undefined) => void] {
    const [setSelectedDraftDigest, getGraftDigest, selectedDraftDigest$] = useComponentTabMetadata<
        TComponentDrafts<string>
    >(
        ComponentMetadataType.RevisionDigest,
        isGate(component) ? component.type : EComponentType.robot,
        component.id,
        ComponentTabKey.Config,
    );

    const initialDraftDigest = useMemo(() => getGraftDigest(), [getGraftDigest]);

    const draftDigest = useSyncObservable(selectedDraftDigest$, initialDraftDigest);

    const digest = draftDigest ?? routerConfigDigest ?? configDigest;

    useEffectOnce(() => {
        if (isNil(routerConfigDigest) || routerConfigDigest === configDigest) {
            return;
        }

        setSelectedDraftDigest(routerConfigDigest);
    });

    return [digest, digest === configDigest, setSelectedDraftDigest];
}

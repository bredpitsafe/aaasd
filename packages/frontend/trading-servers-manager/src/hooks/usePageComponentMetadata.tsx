import {
    useDraft,
    useDraftWithDigest,
} from '@frontend/common/src/components/hooks/components/useDraft';
import { useScrollPosition } from '@frontend/common/src/components/hooks/components/useScrollPosition';
import type { TStatusMessage } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import { useStatusMessageHistory } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import type { TScrollData } from '@frontend/common/src/types/componentMetadata';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import type { EComponentType, TComponentId } from '@frontend/common/src/types/domain/component';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';

interface IPageComponentMetadata {
    readonly getConfigScrollPosition: () => TScrollData | undefined;
    readonly setConfigScrollPosition: (value?: TScrollData) => void;
    readonly customViewDraft: undefined | string;
    readonly hasCustomViewDraft: boolean;
    readonly getCustomViewDraft: () => string | undefined;
    readonly setCustomViewDraft: (value?: string) => void;
    readonly getCustomViewScrollPosition: () => TScrollData | undefined;
    readonly setCustomViewScrollPosition: (value?: TScrollData) => void;
    readonly statusMessageHistory: TStatusMessage[];
}

export function usePageComponentMetadata(
    componentType: EComponentType,
    componentId: TComponentId,
): IPageComponentMetadata {
    const [setConfigDraft, getConfigDraft, configDraft$] = useDraftWithDigest(
        componentType,
        componentId,
        ComponentTabKey.Config,
    );
    const configDraft = useSyncObservable(configDraft$, undefined);

    const [setCustomViewDraft, getCustomViewDraft, customViewDraft$] = useDraft(
        componentType,
        componentId,
        ComponentTabKey.CustomView,
    );
    const customViewDraft = useSyncObservable(customViewDraft$, undefined);

    const [setConfigScrollPosition, getConfigScrollPosition] = useScrollPosition(
        componentType,
        componentId,
        ComponentTabKey.Config,
    );

    const [setCustomViewScrollPosition, getCustomViewScrollPosition] = useScrollPosition(
        componentType,
        componentId,
        ComponentTabKey.CustomView,
    );

    const statusMessageHistory = useStatusMessageHistory(componentType, componentId);

    return useMemo(
        () => ({
            hasConfigDraft: configDraft !== undefined,
            getConfigDraft,
            setConfigDraft,
            getConfigScrollPosition,
            setConfigScrollPosition,
            customViewDraft,
            hasCustomViewDraft: customViewDraft !== undefined,
            getCustomViewDraft,
            setCustomViewDraft,
            getCustomViewScrollPosition,
            setCustomViewScrollPosition,
            statusMessageHistory,
        }),
        [
            configDraft,
            setConfigDraft,
            getConfigDraft,
            customViewDraft,
            setCustomViewDraft,
            getCustomViewDraft,
            setConfigScrollPosition,
            getConfigScrollPosition,
            setCustomViewScrollPosition,
            getCustomViewScrollPosition,
            statusMessageHistory,
        ],
    );
}

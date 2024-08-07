import { tapError } from '@common/rx';
import type { ISO } from '@common/types';
import { useDraftWithDigest } from '@frontend/common/src/components/hooks/components/useDraft';
import type { TUser } from '@frontend/common/src/modules/user';
import type { IDraftValueWithDigest } from '@frontend/common/src/types/componentMetadata';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import type { EComponentType, TComponent } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { isNil } from 'lodash-es';
import { useEffect } from 'react';
import { firstValueFrom, forkJoin, mergeMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ComponentConfigMessage,
    useShowComponentConfigMessage,
} from './useShowComponentConfigMessage';
import { useUpdatableComponentConfig } from './useUpdatableComponentConfig';

export type TDraftedComponentConfig = {
    config: undefined | string;
    draft: undefined | string;
    digest: undefined | string;
    updating: boolean;
    updateDraft: (value: string, digest?: string) => void;
    updateConfig: () => void;
    updatedBy: undefined | TUser;
    updatedAt: undefined | ISO;
};

export function useDraftedComponentConfig(
    type: EComponentType,
    component: TComponent,
): TDraftedComponentConfig {
    const [setConfigDraft, getConfigDraft, draft$] = useDraftWithDigest(
        type,
        component.id,
        ComponentTabKey.Config,
    );
    const draft = useSyncObservable(draft$, undefined);
    const { config, updating, update } = useUpdatableComponentConfig(type, component.id);
    const showMessage = useShowComponentConfigMessage(component.kind, component.name);

    const { updateConfig, updateDraft } = useDraftedConfig(
        config?.raw,
        config?.digest,
        update,
        getConfigDraft,
        setConfigDraft,
        showMessage,
    );

    return {
        config: config?.raw,
        digest: config?.digest,
        draft: draft?.value,
        updating,
        updatedBy: config?.updatedBy,
        updatedAt: config?.updatedAt,
        updateConfig,
        updateDraft,
    };
}

function useDraftedConfig(
    config: undefined | string,
    configDigest: undefined | string,
    configUpdate: undefined | ((value: string, digest?: string) => Promise<void>),
    getDraft: () => undefined | IDraftValueWithDigest,
    setDraft: (draft: undefined | IDraftValueWithDigest) => void,
    showMessage: ReturnType<typeof useShowComponentConfigMessage>,
) {
    useEffect(() => {
        const draft = getDraft();

        if (!isNil(draft) && config === draft.value) {
            setDraft(undefined);
        }
    }, [config, configDigest, getDraft, setDraft, showMessage]);

    const updateDraft = useFunction((value: string) => {
        if (value === config) {
            setDraft(undefined);
        } else {
            const draft = getDraft();
            const digest = draft?.digest ?? configDigest;

            setDraft({ value, digest });
        }
    });

    const updateConfig = useFunction(() => {
        const updater = of(configUpdate).pipe(
            map(
                (configUpdate) =>
                    configUpdate || throwingError(new Error('No configUpdate function')),
            ),
        );
        const draft = of(getDraft()).pipe(
            map((draft) => draft || throwingError(new Error('Config draft is empty'))),
        );
        const getDraftValue$ = (draft: IDraftValueWithDigest) =>
            of(draft).pipe(
                map((draft) => {
                    return draft.digest === configDigest
                        ? draft
                        : throwingError(new Error('Config modified another User'));
                }),
                tapError(() => showMessage(ComponentConfigMessage.ModifiedByUser)),
            );
        const draftValue$ = draft.pipe(mergeMap(getDraftValue$));

        return firstValueFrom(
            forkJoin([updater, draftValue$]).pipe(
                mergeMap(([updater, draft]) => updater(draft.value, draft.digest)),
            ),
        );
    });

    return { updateDraft, updateConfig };
}

import type { TimeZone } from '@common/types';
import { createTestProps } from '@frontend/common/e2e';
import { EConfigTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/config-tab/config.tab.selectors';
import { DisabledView } from '@frontend/common/src/components/Disabled';
import { ConfigFullEditorWithRevisions } from '@frontend/common/src/components/Editors/ConfigFullEditorWithRevisions';
import { useTabEditorState } from '@frontend/common/src/components/Editors/hooks/useTabEditorState';
import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import {
    EConfigEditorLanguages,
    EConfigEditorMode,
} from '@frontend/common/src/components/Editors/types';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { TConfigRevision } from '@frontend/common/src/modules/actions/config/ModuleFetchConfigRevision.ts';
import type { TConfigRevisionLookup } from '@frontend/common/src/modules/actions/config/ModuleFetchConfigRevisions.ts';
import type { TScrollData } from '@frontend/common/src/types/componentMetadata';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil, isString } from 'lodash-es';
import type { Key, ReactElement } from 'react';

import type { TDraftedComponentConfig } from '../../hooks/useDraftedComponentConfig';
import { cnConfigEditor, cnConfigTab, cnTab } from './styles.css';

type TTabConfigProps = {
    configClassName?: string;
    applyButtonClassName?: string;
    config?: TDraftedComponentConfig;
    tabKey: Key;
    getScrollPosition?: () => TScrollData | undefined;
    onSetScrollPosition?: (value?: TScrollData) => void;
    highlightLines?: TEditorProps['highlightLines'];
    selection?: TEditorProps['selection'];
    onChangeSelection?: TEditorProps['onChangeSelection'];
    revisionDigest: undefined | string;
    loadRevision: (digest: string) => Promise<TConfigRevision | undefined>;
    loadRevisions: () => Promise<TConfigRevisionLookup[] | undefined>;
    onRevisionDigestChanged: (digest: undefined | string) => void;
    timeZone: TimeZone;
};

export function TabConfig(props: TTabConfigProps): ReactElement | null {
    const {
        configClassName,
        applyButtonClassName,
        tabKey,
        config,
        revisionDigest,
        highlightLines,
        selection,
        getScrollPosition,
        onSetScrollPosition,
        onChangeSelection,
        loadRevision,
        loadRevisions,
        onRevisionDigestChanged,
        timeZone,
    } = props;

    const handleDiscard = useFunction(() => config?.updateDraft(config?.config ?? ''));

    const { viewMode, changeViewMode } = useTabEditorState({
        key: tabKey,
        viewMode: EConfigEditorMode.single,
    });

    if (isNil(config)) {
        return null;
    }

    return (
        <div className={cnTab} {...createTestProps(EConfigTabSelectors.ConfigList)}>
            {isString(config.config) ? (
                <DisabledView className={cn(cnTab, cnConfigTab)} disabled={config.updating}>
                    <ConfigFullEditorWithRevisions
                        className={cn(cnConfigEditor, configClassName)}
                        applyButtonClassName={applyButtonClassName}
                        value={config.config}
                        modifiedValue={config.draft}
                        onChangeValue={config.updateDraft}
                        language={EConfigEditorLanguages.xml}
                        viewMode={viewMode}
                        onChangeViewMode={changeViewMode}
                        onApply={config.updateConfig}
                        onDiscard={handleDiscard}
                        getScrollPosition={getScrollPosition}
                        onSetScrollPosition={onSetScrollPosition}
                        originalTitle="Server config"
                        modifiedTitle="Edited config"
                        highlightLines={highlightLines}
                        selection={selection}
                        onChangeSelection={onChangeSelection}
                        configDigest={config.digest}
                        revisionDigest={revisionDigest}
                        loadRevisions={loadRevisions}
                        loadRevision={loadRevision}
                        onRevisionDigestChanged={onRevisionDigestChanged}
                        timeZone={timeZone}
                        focusToLine={highlightLines?.start}
                    />
                </DisabledView>
            ) : (
                <LoadingOverlay text="Config loading..." />
            )}
        </div>
    );
}

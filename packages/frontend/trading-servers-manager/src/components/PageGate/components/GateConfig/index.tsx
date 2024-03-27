import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { IModuleBaseActions, ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { TimeZone } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isProdEnvironment } from '@frontend/common/src/utils/url';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import { useConfigDigest } from '../../../../hooks/useConfigDigest';
import { useCurrentGate } from '../../../../hooks/useCurrentGate';
import { useDraftedComponentConfig } from '../../../../hooks/useDraftedComponentConfig';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { useSetEditorConfigParamsFunction } from '../../../../hooks/useSetEditorConfigParamsFunction';
import { EPageGatesLayoutComponents } from '../../../../layouts/gate';
import { ModuleTradingServersManager } from '../../../../modules/observables';
import { ModuleTradingServersManagerRouter } from '../../../../modules/router/module';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabConfig } from '../../../Tabs/TabConfig';
import { cnProdHighlight } from './styles.css';

export function ConnectedGateConfig() {
    const { getState, state$ } = useModule(ModuleTradingServersManagerRouter);
    const { getConfigRevisions } = useModule(ModuleBaseActions);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    const gate = useCurrentGate();

    const initialState = useMemo(
        () => getState(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getState, gate?.id],
    );

    const state = useSyncObservable(state$, initialState);

    const setEditorConfigParams = useSetEditorConfigParamsFunction(
        EPageGatesLayoutComponents.Config,
    );

    const routerConfigSelection = state?.route?.params?.configSelection;

    const configSelection = useMemo(
        () => (isNil(routerConfigSelection) ? undefined : routerConfigSelection),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            routerConfigSelection?.startLine,
            routerConfigSelection?.startColumn,
            routerConfigSelection?.endLine,
            routerConfigSelection?.endColumn,
        ],
    );

    if (
        isNil(gate) ||
        isNil(state) ||
        isNil(state.route.params.socket) ||
        isNil(state.route.params.server)
    ) {
        return <LoadingOverlay />;
    }

    return (
        <InnerConnectedGateConfig
            socket={state.route.params.socket}
            gate={gate}
            routerConfigDigest={state.route.params.configDigest}
            configSelection={configSelection}
            setEditorConfigParams={setEditorConfigParams}
            getConfigRevisions={getConfigRevisions}
            timeZone={timeZone}
        />
    );
}

function InnerConnectedGateConfig(props: {
    socket: TSocketName;
    gate: TGate;
    routerConfigDigest: string | undefined;
    configSelection: TEditorProps['selection'] | undefined;
    setEditorConfigParams: ReturnType<typeof useSetEditorConfigParamsFunction>;
    getConfigRevisions: IModuleBaseActions['getConfigRevisions'];
    timeZone: TimeZone;
}) {
    const { getRevision$ } = useModule(ModuleTradingServersManager);
    const {
        socket,
        gate,
        routerConfigDigest,
        setEditorConfigParams,
        configSelection,
        getConfigRevisions,
        timeZone,
    } = props;
    const config = useDraftedComponentConfig(gate.type, gate);

    const { getConfigScrollPosition, setConfigScrollPosition } = usePageComponentMetadata(
        gate.type,
        gate.id,
    );

    const [digest, isRecentDigest, setDigest] = useConfigDigest(
        gate,
        config.digest,
        routerConfigDigest,
    );

    const revisions$ = useMemo(
        () => getConfigRevisions(gate.id),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getConfigRevisions, gate.id, config.digest],
    );
    const getGateRevisions$ = useCallback(() => revisions$, [revisions$]);

    const getGateRevision$ = useCallback(
        (digest: string) => getRevision$(gate.id, digest),
        [getRevision$, gate.id],
    );

    const [configSelectionComponent, setConfigSelectionComponent] = useSyncState(configSelection, [
        gate.id,
    ]);

    const initialHighlightLines = useMemo(
        () =>
            isNil(configSelectionComponent)
                ? undefined
                : {
                      start: configSelectionComponent.startLine,
                      end: configSelectionComponent.endLine,
                  },
        [configSelectionComponent],
    );

    const [highlightLines, setHighlightLines] = useSyncState(initialHighlightLines, [gate.id]);

    const revisionChanged = useFunction((digest: undefined | string) => {
        setDigest(digest);
        setHighlightLines(undefined);
        setEditorConfigParams({ configDigest: digest });
        setConfigSelectionComponent(undefined);
    });

    const selectionChanged = useFunction((selection: TEditorProps['selection'] | null) => {
        setHighlightLines(undefined);
        setEditorConfigParams({
            configDigest: isRecentDigest ? undefined : digest,
            configSelection:
                isNil(selection) ||
                selection.startLine !== selection.endLine ||
                selection.startColumn !== selection.endColumn
                    ? selection!
                    : undefined,
        });
    });

    const isProd = useMemo(() => isProdEnvironment(socket), [socket]);

    return (
        <TabConfig
            applyButtonClassName={cn({ [cnProdHighlight]: isProd })}
            tabKey={ETabName.config + gate.id}
            config={config}
            getScrollPosition={getConfigScrollPosition}
            onSetScrollPosition={setConfigScrollPosition}
            highlightLines={highlightLines}
            selection={configSelectionComponent}
            onChangeSelection={selectionChanged}
            revisionDigest={digest}
            loadRevisions={getGateRevisions$}
            loadRevision={getGateRevision$}
            onRevisionDigestChanged={revisionChanged}
            timeZone={timeZone}
        />
    );
}

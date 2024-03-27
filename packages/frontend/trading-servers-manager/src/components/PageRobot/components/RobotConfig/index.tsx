import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { IModuleBaseActions, ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { EApplicationName } from '@frontend/common/src/types/app';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
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
import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { useDraftedComponentConfig } from '../../../../hooks/useDraftedComponentConfig';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { useSetEditorConfigParamsFunction } from '../../../../hooks/useSetEditorConfigParamsFunction';
import { EPageRobotsLayoutComponents } from '../../../../layouts/robot';
import { ModuleTradingServersManager } from '../../../../modules/observables';
import { ModuleTradingServersManagerRouter } from '../../../../modules/router/module';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabConfig } from '../../../Tabs/TabConfig';
import { cnProdHighlight } from './styles.css';

export function ConnectedRobotConfig() {
    const { getState, state$ } = useModule(ModuleTradingServersManagerRouter);
    const { getConfigRevisions } = useModule(ModuleBaseActions);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    const robot = useCurrentRobot();

    const initialState = useMemo(
        () => getState(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getState, robot?.id],
    );

    const state = useSyncObservable(state$, initialState);

    const setEditorConfigParams = useSetEditorConfigParamsFunction(
        EPageRobotsLayoutComponents.Config,
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
        isNil(robot) ||
        isNil(state) ||
        isNil(state.route.params.socket) ||
        isNil(state.route.params.server)
    ) {
        return <LoadingOverlay />;
    }

    return (
        <InnerConnectedRobotConfig
            socket={state.route.params.socket}
            robot={robot}
            routerConfigDigest={state.route.params.configDigest}
            configSelection={configSelection}
            setEditorConfigParams={setEditorConfigParams}
            getConfigRevisions={getConfigRevisions}
            timeZone={timeZone}
        />
    );
}

function InnerConnectedRobotConfig(props: {
    socket: TSocketName;
    robot: TRobot;
    routerConfigDigest: string | undefined;
    configSelection: TEditorProps['selection'] | undefined;
    setEditorConfigParams: ReturnType<typeof useSetEditorConfigParamsFunction>;
    getConfigRevisions: IModuleBaseActions['getConfigRevisions'];
    timeZone: TimeZone;
}) {
    const { getRevision$ } = useModule(ModuleTradingServersManager);
    const {
        socket,
        robot,
        routerConfigDigest,
        setEditorConfigParams,
        configSelection,
        getConfigRevisions,
        timeZone,
    } = props;
    const config = useDraftedComponentConfig(EComponentType.robot, robot);

    const { getConfigScrollPosition, setConfigScrollPosition } = usePageComponentMetadata(
        EComponentType.robot,
        robot.id,
    );

    const [digest, isRecentDigest, setDigest] = useConfigDigest(
        robot,
        config.digest,
        routerConfigDigest,
    );

    const revisions$ = useMemo(
        () => getConfigRevisions(robot.id),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getConfigRevisions, robot.id, config.digest],
    );
    const getRobotRevisions$ = useCallback(() => revisions$, [revisions$]);

    const getRobotRevision$ = useCallback(
        (digest: string) => getRevision$(robot.id, digest),
        [getRevision$, robot.id],
    );

    const [configSelectionComponent, setConfigSelectionComponent] = useSyncState(configSelection, [
        robot.id,
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

    const [highlightLines, setHighlightLines] = useSyncState(initialHighlightLines, [robot.id]);

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
            tabKey={ETabName.config + robot.id}
            config={config}
            getScrollPosition={getConfigScrollPosition}
            onSetScrollPosition={setConfigScrollPosition}
            highlightLines={highlightLines}
            selection={configSelectionComponent}
            onChangeSelection={selectionChanged}
            revisionDigest={digest}
            loadRevisions={getRobotRevisions$}
            loadRevision={getRobotRevision$}
            onRevisionDigestChanged={revisionChanged}
            timeZone={timeZone}
        />
    );
}

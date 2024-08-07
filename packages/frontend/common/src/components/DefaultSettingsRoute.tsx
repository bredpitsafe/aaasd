import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { map } from 'rxjs/operators';

import { createTestProps } from '../../e2e';
import { ESettingsModalSelectors } from '../../e2e/selectors/settings.modal.selectors.ts';
import { useModule } from '../di/react';
import { useStages } from '../hooks/useStages.ts';
import { useStageSwitch } from '../hooks/useStageSwitch.ts';
import { ModuleApplicationName } from '../modules/applicationName';
import { ModuleTypicalRouter } from '../modules/router';
import { ModuleSocketList } from '../modules/socketList';
import type { TWithChildren } from '../types/components';
import { useSyncObservable } from '../utils/React/useSyncObservable';
import { AppLogo } from './AppLogo/AppLogo.tsx';
import { cnOverlay } from './connectedComponents/ConnectedStageSwitch/styles.css.ts';
import { cnModalTitle } from './DefaultSettingsRoute.css.ts';
import { Modal } from './Modals.ts';
import { LoadingOverlay } from './overlays/LoadingOverlay';
import { cnField } from './Settings/components/view.css.ts';
import { StageSelect } from './StageSelect/StageSelect.tsx';

export type TRoutesProps = TWithChildren & {
    defaultRouteName: string;
};

export const DefaultSettingsRoute = (props: TRoutesProps): ReactElement => {
    const { state$ } = useModule(ModuleTypicalRouter);
    const routeName$ = useMemo(() => state$.pipe(map((state) => state.route.name)), [state$]);
    const routeName = useSyncObservable(routeName$);
    const { appName, appTitle } = useModule(ModuleApplicationName);
    const { sockets$ } = useModule(ModuleSocketList);

    const loading$ = useMemo(() => sockets$.pipe(map((list) => isNil(list))), [sockets$]);
    const loading = useSyncObservable(loading$);

    const changeStage = useStageSwitch();
    const { favorite, rarelyUsed, active, loading: favoritesLoading } = useStages();

    if (routeName === undefined) {
        return <LoadingOverlay text="Loading router..." />;
    }

    if (routeName === props.defaultRouteName) {
        const title = (
            <div className={cnModalTitle}>
                <AppLogo appName={appName} />
                {appTitle}
            </div>
        );

        return (
            <Modal
                title={title}
                transitionName="none"
                maskTransitionName="none"
                open
                closable={false}
                maskClosable={false}
                footer={null}
                {...createTestProps(ESettingsModalSelectors.SettingsModal)}
            >
                {loading || favoritesLoading ? (
                    <LoadingOverlay
                        className={cnOverlay}
                        text={loading ? 'Loading sockets list...' : 'Loading favorite stages...'}
                    />
                ) : (
                    <StageSelect
                        favoriteStages={favorite}
                        rarelyUsedStages={rarelyUsed}
                        active={active}
                        onStageChange={changeStage}
                        className={cnField}
                        size="middle"
                        type="icon-label"
                        autoFocus
                        defaultOpen
                        closable={false}
                    />
                )}
            </Modal>
        );
    }

    return <>{props.children}</>;
};

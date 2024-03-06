import { ReactElement, ReactNode, useMemo } from 'react';

import { TSettingsStoreName } from '../actors/Settings/db';
import { useModule } from '../di/react';
import { ModuleTypicalRouter } from '../modules/router';
import { ETypicalRoute, ETypicalSearchParams } from '../modules/router/defs';
import { EApplicationName } from '../types/app';
import { TWithChildren } from '../types/components';
import { TSocketName } from '../types/domain/sockets';
import { useSyncObservable } from '../utils/React/useSyncObservable';
import { LoadingOverlay } from './overlays/LoadingOverlay';
import { ConnectedModalSettings } from './Settings/ConnectedModalSettings';

export type TRoutesProps = TWithChildren & {
    applicationName: EApplicationName;
    settingsStoreName: TSettingsStoreName;
    defaultRouteName: string;
    settingsChildren?: ReactNode | ReactNode[];
};

export const DefaultSettingsRoute = (props: TRoutesProps): ReactElement => {
    const { state$, navigate } = useModule(ModuleTypicalRouter);
    const routeState = useSyncObservable(state$);

    return useMemo(() => {
        if (routeState === undefined) {
            return <LoadingOverlay text="Loading router..." />;
        }

        const { route } = routeState;

        switch (route.name) {
            case props.defaultRouteName: {
                return (
                    <ConnectedModalSettings
                        closable={false}
                        onChangeSocket={(socket: TSocketName) => {
                            navigate(ETypicalRoute.Stage, {
                                [ETypicalSearchParams.Socket]: socket,
                            });
                        }}
                        settingsStoreName={props.settingsStoreName}
                    >
                        {props.settingsChildren}
                    </ConnectedModalSettings>
                );
            }

            default: {
                return <>{props.children}</>;
            }
        }
    }, [
        navigate,
        props.children,
        props.defaultRouteName,
        props.settingsChildren,
        props.settingsStoreName,
        routeState,
    ]);
};

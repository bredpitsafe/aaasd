import 'antd/dist/reset.css';

import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement } from 'react';

import { TContextRef } from '../../common/src/di';
import { cnContainer } from './App.css';
import { ConnectedPageComponent } from './components/PageComponent/ConnectedPageComponent';
import { ETradingServersManagerRoutes } from './modules/router/defs';

export const App = (props: { context: TContextRef }): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute
                    applicationName={EApplicationName.TradingServersManager}
                    settingsStoreName={EApplicationName.TradingServersManager}
                    defaultRouteName={ETradingServersManagerRoutes.Default}
                >
                    <ConnectedPageComponent className={cnContainer} />
                </DefaultSettingsRoute>
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

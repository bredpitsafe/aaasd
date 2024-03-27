import 'antd/dist/reset.css';

import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ComponentProps, ReactElement } from 'react';

import { Page } from './components/Page';
import { EWSQueryTerminalRoutes } from './modules/router/def';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute
                    applicationName={EApplicationName.WSQueryTerminal}
                    settingsStoreName={EApplicationName.WSQueryTerminal}
                    defaultRouteName={EWSQueryTerminalRoutes.Default}
                >
                    <Page />
                </DefaultSettingsRoute>
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

import 'antd/dist/reset.css';

import { createTestProps } from '@frontend/common/e2e';
import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { TContextRef } from '@frontend/common/src/di';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement } from 'react';

import { Page } from './components/Page/view';
import { EPortfolioTrackerRoute } from './modules/router/def';

export const App = (props: { context: TContextRef }): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute
                    applicationName={EApplicationName.PortfolioTracker}
                    settingsStoreName={EApplicationName.PortfolioTracker}
                    defaultRouteName={EPortfolioTrackerRoute.Default}
                >
                    <Page {...createTestProps('app')} />
                </DefaultSettingsRoute>
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

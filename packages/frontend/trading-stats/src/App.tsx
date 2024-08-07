import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import { createTestProps } from '@frontend/common/e2e';
import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ComponentProps, ReactElement } from 'react';

import { cnContainer } from './App.css';
import { Layout } from './components/Layout';
import { ETradingStatsRoutes } from './modules/router/defs';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute defaultRouteName={ETradingStatsRoutes.Default}>
                    <Layout className={cnContainer} {...createTestProps('app')} />
                </DefaultSettingsRoute>
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import {
    EHerodotusTerminalSelectors,
    HerodotusTerminalProps,
} from '@frontend/common/e2e/selectors/herodotus-terminal/herodotus-terminal.page.selectors';
import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ComponentProps, ReactElement } from 'react';

import { cnContainer } from './App.css';
import { Layout } from './components/Layout';
import { EHerodotusTerminalRoutes } from './modules/router/def';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute defaultRouteName={EHerodotusTerminalRoutes.Default}>
                    <Layout
                        className={cnContainer}
                        {...HerodotusTerminalProps[EHerodotusTerminalSelectors.App]}
                    />
                </DefaultSettingsRoute>
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

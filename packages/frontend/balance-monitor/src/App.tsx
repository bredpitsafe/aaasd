import 'antd/dist/reset.css';

import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import type { TContextRef } from '@frontend/common/src/di';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement } from 'react';

import { Page } from './components/Page/view';
import { AppSettings } from './components/Settings/AppSettings';
import { EBalanceMonitorRoute } from './modules/router/def';

export const App = (props: { context: TContextRef }): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <DefaultSettingsRoute
                applicationName={EApplicationName.BalanceMonitor}
                settingsStoreName={EApplicationName.BalanceMonitor}
                defaultRouteName={EBalanceMonitorRoute.Default}
                settingsChildren={<AppSettings />}
            >
                <Page />
            </DefaultSettingsRoute>
            <Container />
        </DIProvider>
    );
};

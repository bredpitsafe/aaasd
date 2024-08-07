import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute';
import type { TContextRef } from '@frontend/common/src/di';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ReactElement } from 'react';

import { Page } from './components/Page/view';
import { EBalanceMonitorRoute } from './modules/router/def';

export const App = (props: { context: TContextRef }): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <DefaultSettingsRoute defaultRouteName={EBalanceMonitorRoute.Default}>
                <Page />
            </DefaultSettingsRoute>
            <Container />
        </DIProvider>
    );
};

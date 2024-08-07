import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import { DefaultSettingsRoute } from '@frontend/common/src/components/DefaultSettingsRoute.tsx';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import type { TContextRef } from '@frontend/common/src/di';
import { DIProvider, useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ReactElement } from 'react';

import { Page } from './components/Page/view.tsx';
import { EBacktestingRoute } from './defs/router.ts';

export const App = (props: { context: TContextRef }): ReactElement => {
    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <DefaultSettingsRoute defaultRouteName={EBacktestingRoute.Default}>
                    <Page />
                </DefaultSettingsRoute>
                <ModalContainer />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

function ModalContainer(): ReactElement {
    const { Container } = useModule(ModuleModals);
    return <Container />;
}

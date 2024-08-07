import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider, useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ComponentProps, ReactElement } from 'react';

import { ChartContextMenu } from './components/ContextMenus/chart';
import { Routes } from './components/Routes';

export const App = (props: ComponentProps<typeof DIProvider>) => {
    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <Routes />
                <ChartContextMenu />
                <ModalContainer />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

function ModalContainer(): ReactElement {
    const { Container } = useModule(ModuleModals);
    return <Container />;
}

import 'antd/dist/reset.css';

import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { TContextRef } from '@frontend/common/src/di';
import { DIProvider, useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ReactElement } from 'react';

import { Routes } from './components/Routes';

export const App = (props: { context: TContextRef }): ReactElement => {
    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <Routes />
                <ModalContainer />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

function ModalContainer(): ReactElement {
    const { Container } = useModule(ModuleModals);
    return <Container />;
}

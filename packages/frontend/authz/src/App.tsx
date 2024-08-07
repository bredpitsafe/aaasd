import '@frontend/common/src/components/index.css';
import 'antd/dist/reset.css';

import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { ComponentProps, ReactElement } from 'react';

import { Page } from './Page/view.tsx';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <Page />
                <Container />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

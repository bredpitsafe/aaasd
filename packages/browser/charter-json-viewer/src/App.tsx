import 'antd/dist/reset.css';

import { DIProvider, useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ComponentProps, ReactElement } from 'react';

import { Page } from './components/Page/view';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    return (
        <DIProvider context={props.context}>
            <ModalContainer />
            <Page />
        </DIProvider>
    );
};

function ModalContainer(): ReactElement {
    const { Container } = useModule(ModuleModals);
    return <Container />;
}

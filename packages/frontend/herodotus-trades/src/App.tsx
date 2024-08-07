import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import { createTestProps } from '@frontend/common/e2e';
import { EHerodotusTradesSelectors } from '@frontend/common/e2e/selectors/herodotus-trades/herodotus-trades.page.selectors';
import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification';
import { DIProvider } from '@frontend/common/src/di/react';
import type { ComponentProps, ReactElement } from 'react';

import { Root } from './components/Root';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <Root {...createTestProps(EHerodotusTradesSelectors.App)} />
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

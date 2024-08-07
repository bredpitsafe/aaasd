import '@frontend/common/src/components/index.css';

import { NotSupportedBrowserNotification } from '@frontend/common/src/components/NotSupportedBrowserNotification.tsx';
import { DIProvider } from '@frontend/common/src/di/react.tsx';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import cn from 'classnames';
import type { ComponentProps, ReactElement } from 'react';

import { cnBuildInfo, cnContent, cnExternalLinks, cnFooter, cnRoot } from './App.css.ts';
import { AppLinks } from './components/AppLinks/AppLinks.tsx';
import { BuildInfo } from './components/BuildInfo/BuildInfo.tsx';
import { ExternalLinks } from './components/ExternalLinks/ExternalLinks.tsx';

export const App = (props: ComponentProps<typeof DIProvider>): ReactElement => {
    const { Container } = ModuleModals(props.context);

    return (
        <DIProvider context={props.context}>
            <NotSupportedBrowserNotification>
                <div className={cn(cnRoot)}>
                    <AppLinks className={cnContent} />
                    <div className={cnFooter}>
                        <ExternalLinks className={cnExternalLinks} />
                        <BuildInfo className={cnBuildInfo} />
                    </div>

                    <Container />
                </div>
            </NotSupportedBrowserNotification>
        </DIProvider>
    );
};

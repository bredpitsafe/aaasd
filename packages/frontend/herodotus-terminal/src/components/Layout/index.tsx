import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { ReactElement } from 'react';

import { ELayoutIds } from '../../layouts';
import { defaultLayoutFactory } from '../../layouts/default';
import { ModuleHerodotusTerminalRouter } from '../../modules/router/module';
import type { TLayoutProps } from './view';
import { LayoutView } from './view';

export const Layout = (props: TLayoutProps): ReactElement => {
    const { state$, setParams } = useModule(ModuleHerodotusTerminalRouter);
    const routeState = useSyncObservable(state$);

    const cbSelectTab = useFunction((tab: string) => void setParams({ tab }));

    const layout = useLayout({
        layoutId: ELayoutIds.Default,
        factory: defaultLayoutFactory,
        onSelectTab: cbSelectTab,
    });

    return (
        <LayoutView {...props} route={routeState?.route?.name} onResetLayout={layout.onResetLayout}>
            {layout.component}
        </LayoutView>
    );
};

import type { ValueOf } from '@common/types';
import { createTestProps } from '@frontend/common/e2e';
import { ETradingStatsSelectors } from '@frontend/common/e2e/selectors/trading-stats/trading-stats.page.selectors';
import { Layout as AntLayout } from '@frontend/common/src/components/Layout';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { ELayoutIds, getLayoutComponents, getSubLayoutFactory } from '../../layouts';
import { createGlobalComponentFactory } from '../../layouts/global';
import type { ETradingStatsRoutes } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { Nav } from '../Nav/view';
import { ExcludedStrategies } from '../Settings/ExcludedStrategies/ExcludedStrategies.tsx';
import { getLayoutId } from './utils';
import { cnLayout, cnRoot } from './view.css';

type TLayoutProps = TWithClassname;

export const Layout = (props: TLayoutProps): ReactElement => {
    const { state$, setParams } = useModule(ModuleTradingStatsRouter);
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft } = useModule(ModuleLayouts);

    const routeState = useSyncObservable(state$);
    const routeName = routeState?.route?.name as undefined | ValueOf<typeof ETradingStatsRoutes>;
    const routeParams = routeState?.route?.params;

    const cbOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: (
                <>
                    <ExcludedStrategies />
                    <TimeZoneSelector extendTimeZoneList={false} />
                </>
            ),
        });
    });

    const cbSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const layoutId: ELayoutIds | undefined = useMemo(() => getLayoutId(routeName), [routeName]);

    const subFactory = useMemo(
        () => (layoutId ? getSubLayoutFactory(layoutId) : undefined),
        [layoutId],
    );

    const subLayout = useLayout({
        layoutId,
        factory: subFactory,
        onSelectTab: cbSelectTab,
    });
    const globalFactory = useMemo(
        () => createGlobalComponentFactory(subLayout.component, subLayout.loading),
        [subLayout.component, subLayout.loading],
    );
    const mainLayout = useLayout({
        layoutId: ELayoutIds.Global,
        factory: globalFactory,
        useModel: false,
    });

    const cbResetLayout = useFunction(() => {
        subLayout.onResetLayout();
        mainLayout.onResetLayout();
    });

    const layoutComponents = getLayoutComponents(layoutId);

    return (
        <div
            className={cn(cnRoot, props.className)}
            {...createTestProps(ETradingStatsSelectors.App)}
        >
            <Nav
                routeName={routeName}
                routeParams={routeParams}
                openModalSettings={cbOpenModalSettings}
                components={layoutComponents}
                onResetLayout={cbResetLayout}
                onResetToSaved={dropDraft}
            />
            <AntLayout className={cnLayout}>{mainLayout.component}</AntLayout>
        </div>
    );
};

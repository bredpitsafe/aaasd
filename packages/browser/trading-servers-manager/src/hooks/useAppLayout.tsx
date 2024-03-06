import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useMemo } from 'react';

import { useCompactComponentsMenu } from '../components/Settings/hooks/useCompactComponentsMenu';
import { ELayoutIds, getLayoutComponents, getSubLayoutFactory } from '../layouts';
import { createGlobalComponentFactory } from '../layouts/global';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';
import { useLayoutId } from './useLayoutId';
import { useLayoutTitleFactory } from './useLayoutTitleFactory';

export function useAppLayout() {
    const { setParams } = useModule(ModuleTradingServersManagerRouter);
    const { dropDraft, getRootLayoutId } = useModule(ModuleLayouts);
    const [compact] = useCompactComponentsMenu();

    const cbSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const layoutId = useLayoutId();
    const components = useMemo(
        () => getLayoutComponents(layoutId ? getRootLayoutId(layoutId) : undefined),
        [getRootLayoutId, layoutId],
    );
    const titleFactory = useLayoutTitleFactory(layoutId);
    const subFactory = useMemo(
        () => (layoutId ? getSubLayoutFactory(getRootLayoutId(layoutId)) : undefined),
        [getRootLayoutId, layoutId],
    );
    const subLayout = useLayout({
        layoutId: layoutId,
        factory: subFactory,
        onSelectTab: cbSelectTab,
        titleFactory,
    });

    const globalFactory = useMemo(
        () => createGlobalComponentFactory(subLayout.component, subLayout.loading),
        [subLayout.component, subLayout.loading],
    );
    const mainLayout = useLayout({
        layoutId: compact ? ELayoutIds.GlobalNoMenu : ELayoutIds.Global,
        factory: globalFactory,
        useModel: false,
    });
    const resetLayout = useFunction(() => {
        subLayout.onResetLayout();
        mainLayout.onResetLayout();
    });

    return {
        layoutId,
        subLayout,
        mainLayout,
        components,
        resetLayout,
        resetToSaved: dropDraft,
    };
}

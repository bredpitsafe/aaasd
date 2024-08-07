import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { logger } from '@frontend/common/src/utils/Tracing';
import { Actions } from 'flexlayout-react';
import { isNil } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { usePrevious } from 'react-use';

import { useCompactComponentsMenu } from '../components/Settings/hooks/useCompactComponentsMenu';
import { ELayoutIds, getLayoutComponents, getSubLayoutFactory } from '../layouts';
import {
    createGlobalComponentFactory,
    DEFAULT_MENU_WIDTH,
    EGlobalLayoutComponents,
} from '../layouts/global';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';
import { useLayoutId } from './useLayoutId';
import { useLayoutTitleFactory } from './useLayoutTitleFactory';

export function useAppLayout() {
    const { setParams } = useModule(ModuleTradingServersManagerRouter);
    const { dropDraft, saveDraft, getRootLayoutId } = useModule(ModuleLayouts);

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
        layoutId: ELayoutIds.Global,
        factory: globalFactory,
        useModel: false,
    });

    const [compact] = useCompactComponentsMenu();
    const prevCompact = usePrevious(compact);
    useEffect(() => {
        if (prevCompact !== compact) {
            if (isNil(mainLayout.model)) {
                return;
            }

            const id = EGlobalLayoutComponents.MenuTabset;
            const node = mainLayout.model.getNodeById(id);
            // In some rare cases, Menu node can't be found in layout.
            // Log this case, but do not crash the component.
            if (isNil(node)) {
                logger.error('menu tabset node not found in layout, cannot switch compact mode');
                return;
            }

            mainLayout.model.doAction(
                Actions.updateNodeAttributes(EGlobalLayoutComponents.MenuTabset, {
                    width: compact ? 0 : DEFAULT_MENU_WIDTH,
                }),
            );
            saveDraft(ELayoutIds.Global, false);
        }
    }, [prevCompact, compact, mainLayout.model, saveDraft]);

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

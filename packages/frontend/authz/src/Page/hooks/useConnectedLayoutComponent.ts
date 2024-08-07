import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactNode } from 'react';

import { defaultLayoutFactory } from '../../layouts/default.tsx';
import { ELayoutIds, layoutComponents } from '../../layouts/index.ts';
import { ModuleAuthzRouter } from '../../modules/router/module.ts';

export function useConnectedLayoutComponent(): [ReactNode, VoidFunction, string[]] {
    const { setParams } = useModule(ModuleAuthzRouter);

    const handleSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const { component, onResetLayout } = useLayout({
        layoutId: ELayoutIds.Default,
        factory: defaultLayoutFactory,
        onSelectTab: handleSelectTab,
    });

    return [component, onResetLayout, layoutComponents];
}

import { useModule } from '@frontend/common/src/di/react.tsx';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useMemo } from 'react';

import { getTerminalComponent } from '../../layouts/terminal';
import { ModuleWSQueryTerminalRouter } from '../../modules/router/module.ts';
import { getLayoutId } from './getLayoutId';

export const Terminal = (props: TWithClassname) => {
    const { setParams } = useModule(ModuleWSQueryTerminalRouter);

    const layoutId = useMemo(getLayoutId, []);

    const cbSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const layout = useLayout({
        layoutId,
        factory: getTerminalComponent,
        onSelectTab: cbSelectTab,
    });

    return <div className={props.className}>{layout.component}</div>;
};

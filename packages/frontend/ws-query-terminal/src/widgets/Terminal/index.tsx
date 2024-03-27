import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useMemo } from 'react';

import { getTerminalComponent } from '../../layouts/terminal';
import { getLayoutId } from './getLayoutId';

export const Terminal = (props: TWithClassname) => {
    const layoutId = useMemo(getLayoutId, []);

    const layout = useLayout({
        layoutId,
        factory: getTerminalComponent,
    });

    return <div className={props.className}>{layout.component}</div>;
};

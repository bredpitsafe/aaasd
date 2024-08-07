import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { type ReactElement, useCallback } from 'react';

import { useConnectedLayoutComponent } from '../Page/hooks/useConnectedLayoutComponent';
import { cnNav, cnRoot } from '../Page/view.css';

export function WidgetLayout(props: TWithClassname): ReactElement | null {
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft } = useModule(ModuleLayouts);

    const handleOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: (
                <>
                    <TimeZoneSelector extendTimeZoneList />
                </>
            ),
        });
    });

    const [component, onResetLayout, layoutComponents] = useConnectedLayoutComponent();

    const cbRenderChildren: TNavChildRenderFunction = useCallback(({}) => {
        return <div className={cn(cnSection, cnSectionFill)}></div>;
    }, []);

    return (
        <>
            <ConnectedNav
                flexLayoutControls
                appSwitchControls
                layoutComponents={layoutComponents}
                className={cnNav}
                onOpenModalSettings={handleOpenModalSettings}
                onResetLayout={onResetLayout}
                onResetToSavedLayout={dropDraft}
            >
                {cbRenderChildren}
            </ConnectedNav>

            <div className={cn(cnRoot, props.className)}>{component}</div>
        </>
    );
}

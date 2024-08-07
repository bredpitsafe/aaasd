import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { Nav } from '../../Nav/view';
import { CoinSelectionTabs } from '../../Settings/CoinSelectionTabs.tsx';
import { ShowCoinIcons } from '../../Settings/ShowCoinIcons.tsx';
import { ShowLocalhost } from '../../Settings/ShowLocalhost.tsx';
import { useConnectedLayoutComponent } from '../hooks/useConnectedLayoutComponent';
import { cnNav, cnRoot } from '../view.css';

export function ConnectedLayout(props: TWithClassname): ReactElement | null {
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft } = useModule(ModuleLayouts);

    const handleOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: (
                <>
                    <TimeZoneSelector extendTimeZoneList={false} />
                    <ShowCoinIcons />
                    <CoinSelectionTabs />
                </>
            ),
            advancedChildren: (
                <>
                    <ShowLocalhost />
                </>
            ),
        });
    });

    const [component, resetLayout, layoutComponents] = useConnectedLayoutComponent();

    return (
        <>
            <Nav
                className={cnNav}
                components={layoutComponents}
                onOpenModalSettings={handleOpenModalSettings}
                onResetLayout={resetLayout}
                onResetToSaved={dropDraft}
            />
            <div className={cn(cnRoot, props.className)}>{component}</div>
        </>
    );
}

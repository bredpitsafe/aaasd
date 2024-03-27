import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import cn from 'classnames';
import { ReactElement, useMemo } from 'react';

import { Nav } from '../../Nav/view';
import { AppSettings } from '../../Settings/AppSettings';
import { useConnectedLayoutComponent } from '../hooks/useConnectedLayoutComponent';
import { cnNav, cnRoot } from '../view.css';

export function ConnectedLayout(props: TWithClassname): ReactElement | null {
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft } = useModule(ModuleLayouts);

    const [timeZoneInfo] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);
    const timeZoneName = useMemo(() => getTimeZoneFullName(timeZoneInfo), [timeZoneInfo]);

    const handleOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: <AppSettings />,
            settingsStoreName: EApplicationName.BalanceMonitor,
        });
    });

    const [component, resetLayout, layoutComponents] = useConnectedLayoutComponent();

    return (
        <>
            <Nav
                className={cnNav}
                components={layoutComponents}
                timeZoneName={timeZoneName}
                onResetLayout={resetLayout}
                onResetToSaved={dropDraft}
                onOpenModalSettings={handleOpenModalSettings}
            />
            <div className={cn(cnRoot, props.className)}>{component}</div>
        </>
    );
}

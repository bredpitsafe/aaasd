import { useUtcTimeZoneInfo } from '@frontend/common/src/components/Settings/hooks/useUtcTimeZoneInfo';
import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import cn from 'classnames';
import { ReactElement, useMemo } from 'react';

import { ELayoutIds } from '../../../layouts';
import { defaultLayoutComponents, defaultLayoutFactory } from '../../../layouts/default';
import { ModulePortfolioTrackerRouter } from '../../../modules/router/module';
import { Nav } from '../../Nav/view';
import { AppSettings } from '../../Settings/AppSettings';
import { cnNav, cnRoot } from '../view.css';

type TConnectedLayoutProps = TWithClassname;
export function ConnectedLayout(props: TConnectedLayoutProps): ReactElement | null {
    const { openModalSettings } = useModule(ModuleSettings);
    const { setParams } = useModule(ModulePortfolioTrackerRouter);
    const { dropDraft } = useModule(ModuleLayouts);

    const timeZoneInfo = useUtcTimeZoneInfo();
    const timeZoneName = useMemo(() => getTimeZoneFullName(timeZoneInfo), [timeZoneInfo]);

    const handleSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });
    const handleOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: <AppSettings />,
            settingsStoreName: EApplicationName.PortfolioTracker,
        });
    });

    const layout = useLayout({
        layoutId: ELayoutIds.Default,
        factory: defaultLayoutFactory,
        onSelectTab: handleSelectTab,
    });

    return (
        <>
            <Nav
                className={cnNav}
                components={defaultLayoutComponents}
                timeZoneName={timeZoneName}
                onResetLayout={layout.onResetLayout}
                onResetToSaved={dropDraft}
                onOpenModalSettings={handleOpenModalSettings}
            />
            <div className={cn(cnRoot, props.className)}>{layout.component}</div>
        </>
    );
}

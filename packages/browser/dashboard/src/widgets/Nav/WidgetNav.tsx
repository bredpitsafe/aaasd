import { ConnectedNav as CommonNav } from '@frontend/common/src/components/Nav';
import { EGeneralSettingsSection } from '@frontend/common/src/components/Settings/components/General';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import { useMemo, useRef } from 'react';
import { useToggle } from 'react-use';
import { map } from 'rxjs/operators';

import { ChartHorizontalCrosshair } from '../../components/Settings/ChartHorizontalCrosshair.tsx';
import { FontSize } from '../../components/Settings/FontSize.tsx';
import { PanelCollapse } from '../../components/Settings/PanelCollapse.tsx';
import { PanelConfirmDelete } from '../../components/Settings/PanelConfirmDelete.tsx';
import { PanelName } from '../../components/Settings/PanelName.tsx';
import { ServiceStageName } from '../../components/Settings/ServiceStageName/serviceStageName.tsx';
import { ModuleDashboardRouter } from '../../modules/router/module';
import { EDashboardRoutes } from '../../types/router';
import { WidgetDialogDashboardList } from '../WidgetDialogDashboardList/WidgetDialogDashboardList';
import { useNavChildren } from './components/useNavChildren';
import { cnContainer, cnDialog, cnDialogContainer } from './WidgetNav.css';

export function WidgetNav(props: TWithClassname) {
    const { openModalSettings } = useModule(ModuleSettings);
    const { state$ } = useModule(ModuleDashboardRouter);

    const forceShowDashboardSidebar = useSyncObservable(
        useMemo(
            () => state$.pipe(map((state) => state.route.name === EDashboardRoutes.Default)),
            [state$],
        ),
        false,
    );

    const dashboardDialogRef = useRef<HTMLDivElement>(null);

    const [showDashboardsDialog, _toggleDashboardsDialog] = useToggle(false);
    const onToggleDashboardsDialog = useFunction((state?: boolean) => {
        _toggleDashboardsDialog(state);
    });
    const hideDashboardsDialog = useFunction(() => {
        onToggleDashboardsDialog(false);
    });

    const handleOpenModalSettings = useFunction(() =>
        openModalSettings({
            children: (
                <>
                    <TimeZoneSelector
                        appName={EApplicationName.Dashboard}
                        extendTimeZoneList={true}
                    />
                    <FontSize />
                    <PanelCollapse />
                    <PanelName />
                    <PanelConfirmDelete />
                    <ChartHorizontalCrosshair />
                </>
            ),
            advancedChildren: <ServiceStageName />,
            settingsToHide: [EGeneralSettingsSection.StageSelector],
            settingsStoreName: EApplicationName.Dashboard,
        }),
    );

    const navChildren = useNavChildren({ onToggleDashboardsDialog });

    return (
        <div className={cn(props.className, cnContainer)}>
            <CommonNav
                appName={EApplicationName.Dashboard}
                onOpenModalSettings={handleOpenModalSettings}
            >
                {navChildren}
            </CommonNav>
            <div className={cnDialogContainer}>
                <WidgetDialogDashboardList
                    ref={dashboardDialogRef}
                    className={cnDialog}
                    visible={forceShowDashboardSidebar || showDashboardsDialog}
                    onHide={forceShowDashboardSidebar ? undefined : hideDashboardsDialog}
                />
            </div>
        </div>
    );
}

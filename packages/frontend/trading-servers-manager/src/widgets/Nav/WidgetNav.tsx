import { ClockCircleOutlined } from '@ant-design/icons';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedAddTabButton } from '@frontend/common/src/components/AddTabButton/ConnectedAddTabButton';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import {
    TNavChildRenderFunction,
    TNavChildrenProps,
} from '@frontend/common/src/components/Nav/view';
import {
    cnDivider,
    cnSection,
    cnSectionFill,
    cnTimeZoneIcon,
} from '@frontend/common/src/components/Nav/view.css';
import { EGeneralSettingsSection } from '@frontend/common/src/components/Settings/components/General';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import cn from 'classnames';
import { memo, ReactElement, useCallback } from 'react';

import { AppSettings } from '../../components/Settings/AppSettings';
import { useCompactComponentsMenu } from '../../components/Settings/hooks/useCompactComponentsMenu';
import { useAppLayout } from '../../hooks/useAppLayout';
import { WidgetCompactMenuButton } from '../CompactMenuButton/WidgetCompactMenuButton';
import { ComponentsOverallStatus } from '../ComponentsOverallStatus';
import { cnTimeZone } from './WidgetNav.css';

const APP_NAME = EApplicationName.TradingServersManager;

export function WidgetNav(props: TWithClassname): ReactElement {
    const { openModalSettings } = useModule(ModuleSettings);

    const cbOpenModalSettings = useFunction(() =>
        openModalSettings({
            children: <AppSettings />,
            settingsToHide: [EGeneralSettingsSection.StageSelector],
            settingsStoreName: APP_NAME,
        }),
    );

    const cbRenderChildren: TNavChildRenderFunction = useCallback(({ type, collapsed }) => {
        return <NavChildren type={type} collapsed={collapsed} />;
    }, []);

    return (
        <ConnectedNav
            appName={APP_NAME}
            className={props.className}
            onOpenModalSettings={cbOpenModalSettings}
        >
            {cbRenderChildren}
        </ConnectedNav>
    );
}

const NavChildren = memo(({ type, collapsed }: TNavChildrenProps) => {
    const { resetLayout, components, resetToSaved } = useAppLayout();
    const [timeZoneInfo] = useTimeZoneInfoSettings(APP_NAME);
    const timeZoneName = getTimeZoneFullName(timeZoneInfo);
    const [compact] = useCompactComponentsMenu();

    if (type === ENavType.Hidden) {
        return (
            <>
                <ConnectedStageSwitch size="large" type="float" settingsStoreName={APP_NAME} />
                <WidgetCompactMenuButton type="float" />
            </>
        );
    }

    const buttonType = collapsed ? 'icon' : 'icon-label';
    return (
        <>
            <div className={cn(cnSection, cnSectionFill)}>
                {collapsed ? (
                    <Tooltip title={timeZoneName} showArrow={false}>
                        <div className={cnTimeZoneIcon}>
                            <ClockCircleOutlined />
                        </div>
                    </Tooltip>
                ) : (
                    <div className={cnTimeZone}>{timeZoneName}</div>
                )}
                <WidgetCompactMenuButton type={buttonType} />
                {compact && <ComponentsOverallStatus vertical />}
            </div>
            <div className={cnSection}>
                <LayoutDraftSaver size="middle" type={buttonType} />
                <ConnectedAddTabButton size="middle" components={components}>
                    {collapsed ? null : 'Add Components'}
                </ConnectedAddTabButton>
                <LayoutReset
                    onResetToDefault={resetLayout}
                    onResetToSaved={resetToSaved}
                    size="middle"
                    type={buttonType}
                />
                <Divider type="horizontal" className={cnDivider} />
                <ConnectedStageSwitch
                    size="middle"
                    type={buttonType}
                    settingsStoreName={APP_NAME}
                />
            </div>
        </>
    );
});

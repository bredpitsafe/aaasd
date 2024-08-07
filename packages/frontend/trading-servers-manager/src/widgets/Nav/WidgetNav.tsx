import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type {
    TNavChildRenderFunction,
    TNavChildrenProps,
} from '@frontend/common/src/components/Nav/view';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import { ComponentsDraftUnsavedWarning } from '@frontend/common/src/components/Settings/components/ComponentsDraftUnsavedWarning.tsx';
import { EGeneralSettingsSection } from '@frontend/common/src/components/Settings/components/General';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { memo, useCallback } from 'react';

import { ConfirmProdSettings } from '../../components/Settings/ConfirmProdSettings.tsx';
import { useCompactComponentsMenu } from '../../components/Settings/hooks/useCompactComponentsMenu';
import { useAppLayout } from '../../hooks/useAppLayout';
import { WidgetCompactMenuButton } from '../CompactMenuButton/WidgetCompactMenuButton';
import { ComponentsOverallStatus } from '../ComponentsOverallStatus';

export function WidgetNav({ className }: TWithClassname): ReactElement {
    const { openModalSettings } = useModule(ModuleSettings);
    const { resetLayout, components, resetToSaved } = useAppLayout();

    const cbOpenModalSettings = useFunction(() =>
        openModalSettings({
            children: (
                <>
                    <ComponentsDraftUnsavedWarning />
                    <ConfirmProdSettings />
                    <TimeZoneSelector extendTimeZoneList />
                </>
            ),
            settingsToHide: [EGeneralSettingsSection.StageSelector],
        }),
    );

    const cbRenderChildren: TNavChildRenderFunction = useCallback(({ type, collapsed }) => {
        return <NavChildren type={type} collapsed={collapsed} />;
    }, []);

    return (
        <ConnectedNav
            flexLayoutControls
            appSwitchControls
            stageSwitchControls
            timeZoneIndicator
            layoutComponents={components}
            className={className}
            onOpenModalSettings={cbOpenModalSettings}
            onResetLayout={resetLayout}
            onResetToSavedLayout={resetToSaved}
        >
            {cbRenderChildren}
        </ConnectedNav>
    );
}

const NavChildren = memo(({ type, collapsed }: TNavChildrenProps) => {
    const [compact] = useCompactComponentsMenu();

    if (type === ENavType.Hidden) {
        return (
            <>
                <WidgetCompactMenuButton type="float" />
            </>
        );
    }

    const buttonType = collapsed ? 'icon' : 'icon-label';
    return (
        <>
            <div className={cn(cnSection, cnSectionFill)}>
                <WidgetCompactMenuButton type={buttonType} />
                {compact && <ComponentsOverallStatus vertical />}
            </div>
        </>
    );
});

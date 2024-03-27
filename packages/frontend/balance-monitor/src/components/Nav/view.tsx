import { ClockCircleOutlined } from '@ant-design/icons';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedAddTabButton } from '@frontend/common/src/components/AddTabButton/ConnectedAddTabButton';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import {
    cnDivider,
    cnSection,
    cnSectionFill,
    cnTimeZone,
    cnTimeZoneIcon,
} from '@frontend/common/src/components/Nav/view.css';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import cn from 'classnames';
import { ReactElement, useCallback } from 'react';

import { WidgetComponentStatuses } from '../../widgets/WidgetComponentStatuses';
import { WidgetLayoutAdditionalControls } from '../../widgets/WidgetLayoutAdditionalControls';
import { WidgetLayoutSelector } from '../../widgets/WidgetLayoutSelector';
import { WidgetPumpAndDump } from '../../widgets/WidgetPumpAndDump';
import { cnComponentStatuses, cnNewManualTransfer } from './view.css';

export function Nav(
    props: TWithClassname & {
        components: string[];
        timeZoneName: string;
        onResetLayout: VoidFunction;
        onResetToSaved: VoidFunction;
        onOpenModalSettings: VoidFunction;
    },
): ReactElement {
    const cbChildren = useNavChildrenRender(
        props.components,
        props.timeZoneName,
        props.onResetLayout,
        props.onResetToSaved,
    );

    return (
        <ConnectedNav
            appName={EApplicationName.BalanceMonitor}
            className={props.className}
            onOpenModalSettings={props.onOpenModalSettings}
        >
            {cbChildren}
        </ConnectedNav>
    );
}

function useNavChildrenRender(
    components: string[],
    timeZoneName: string,
    onResetLayout: VoidFunction,
    onResetToSaved: VoidFunction,
): TNavChildRenderFunction {
    return useCallback(
        ({ type, collapsed }) => {
            if (type === ENavType.Hidden) {
                return (
                    <>
                        <WidgetLayoutSelector type={type} />
                        <ConnectedStageSwitch
                            size="large"
                            type="float"
                            settingsStoreName={EApplicationName.BalanceMonitor}
                        />
                    </>
                );
            }

            return (
                <>
                    <div className={cnSection}>
                        {collapsed ? (
                            <Tooltip title={timeZoneName} showArrow={false}>
                                <div className={cnTimeZoneIcon}>
                                    <ClockCircleOutlined />
                                </div>
                            </Tooltip>
                        ) : (
                            <div className={cnTimeZone}>{timeZoneName}</div>
                        )}
                    </div>

                    <div className={cnSection}>
                        <WidgetLayoutSelector type={type} />
                    </div>

                    <WidgetLayoutAdditionalControls
                        className={cn(cnSection, cnNewManualTransfer)}
                        type={type}
                    />

                    <WidgetComponentStatuses
                        className={cnComponentStatuses}
                        collapsed={collapsed}
                    />

                    <WidgetPumpAndDump className={cnSection} collapsed={collapsed} />

                    <div className={cnSectionFill} />

                    <div className={cnSection}>
                        <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                        <ConnectedAddTabButton size="middle" components={components}>
                            {collapsed ? null : 'Add Components'}
                        </ConnectedAddTabButton>
                        <LayoutReset
                            onResetToDefault={onResetLayout}
                            onResetToSaved={onResetToSaved}
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                        />
                        <Divider type="horizontal" className={cnDivider} />
                        <ConnectedStageSwitch
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                            settingsStoreName={EApplicationName.BalanceMonitor}
                        />
                    </div>
                </>
            );
        },
        [components, onResetLayout, onResetToSaved, timeZoneName],
    );
}

import { ClockCircleOutlined } from '@ant-design/icons';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedAddTabButton } from '@frontend/common/src/components/AddTabButton/ConnectedAddTabButton';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
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

import { ConnectedDownloadDebugInfoButton } from '../connectedComponents/ConnectedDownloadDebugInfoButton';

type TNavProps = TWithClassname & {
    components: string[];
    timeZoneName: string;
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
    onOpenModalSettings: VoidFunction;
};

export function Nav(props: TNavProps): ReactElement {
    const cbRenderChild = useNavChildrenRender(
        props.components,
        props.timeZoneName,
        props.onResetLayout,
        props.onResetToSaved,
    );

    return (
        <ConnectedNav
            appName={EApplicationName.PortfolioTracker}
            className={props.className}
            onOpenModalSettings={props.onOpenModalSettings}
        >
            {cbRenderChild}
        </ConnectedNav>
    );
}

function useNavChildrenRender(
    components: TNavProps['components'],
    timeZoneName: TNavProps['timeZoneName'],
    onResetLayout: TNavProps['onResetLayout'],
    onResetToSaved: TNavProps['onResetToSaved'],
): TNavChildRenderFunction {
    return useCallback(
        ({ type, collapsed }) => {
            if (type === ENavType.Hidden) {
                return (
                    <>
                        <ConnectedStageSwitch
                            size="large"
                            type="float"
                            settingsStoreName={EApplicationName.PortfolioTracker}
                        />
                    </>
                );
            }

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
                        <ConnectedDownloadDebugInfoButton size="middle">
                            {collapsed ? null : 'Download Debug Info'}
                        </ConnectedDownloadDebugInfoButton>
                    </div>
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
                            settingsStoreName={EApplicationName.PortfolioTracker}
                        />
                    </div>
                </>
            );
        },
        [components, onResetLayout, onResetToSaved, timeZoneName],
    );
}

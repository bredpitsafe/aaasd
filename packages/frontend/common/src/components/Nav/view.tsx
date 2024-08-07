import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    EllipsisOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    MenuOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo, useRef } from 'react';
import { useFullscreen, useToggle } from 'react-use';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors.ts';
import { ENavType } from '../../actors/Settings/types';
import type { TWithChildren, TWithClassname } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import { WidgetAppSelect } from '../../widgets/AppSelect/WidgetAppSelect.tsx';
import { LayoutDraftSaver } from '../../widgets/LayoutDraftSaver';
import { WidgetTimeZoneInfo } from '../../widgets/WidgetTimeZoneInfo/WidgetTimeZoneInfo';
import { ConnectedAddTabButton } from '../AddTabButton/ConnectedAddTabButton';
import { Button } from '../Button';
import { ConnectedAuthenticationButton } from '../connectedComponents/ConnectedAuthenticationButton.tsx';
import { ConnectedNetworkStatus } from '../connectedComponents/ConnectedNetworkStatus.tsx';
import { ConnectedNotificationsList } from '../connectedComponents/ConnectedNotificationsList.tsx';
import { ConnectedStageSwitch } from '../connectedComponents/ConnectedStageSwitch';
import { Divider } from '../Divider';
import { FloatButton } from '../FloatButton';
import { LayoutReset } from '../LayoutReset';
import { Popover } from '../Popover.ts';
import { SettingsButton } from '../SettingsButton.tsx';
import {
    cnDivider,
    cnNavBottomCollapse,
    cnNavBottomFull,
    cnRoot,
    cnSection,
    cnSectionRow,
    cnShowNavButton,
} from './view.css';

export type TNavChildrenProps = {
    collapsed: boolean;
    type: ENavType;
};

export type TNavChildRenderFunction = (
    params: TNavChildrenProps,
) => TWithChildren['children'] | undefined;

export type TNavProps = TWithClassname &
    TWithChildren<TNavChildRenderFunction> & {
        navTypeLoading: boolean;
        type: ENavType | undefined;
        flexLayoutControls?: boolean;
        appSwitchControls?: boolean;
        stageSwitchControls?: boolean;
        timeZoneIndicator?: boolean;
        layoutComponents?: string[];
        singleTabMode?: boolean;
        onTypeChange: (type: ENavType) => void;
        onOpenModalSettings: VoidFunction;
        onExitSingleTabMode?: VoidFunction;
        onResetLayout?: VoidFunction;
        onResetToSavedLayout?: VoidFunction;
        keepRestParams?: boolean;
    };

type TCollapsableNavigationProps = {
    type: TNavProps['type'];
    navTypeLoading: TNavProps['navTypeLoading'];
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    onOpenModalSettings: () => void;
    makeSmaller: () => void;
    makeBigger: () => void;
};

const CollapsableNavigation = (props: TCollapsableNavigationProps) => {
    const {
        type,
        navTypeLoading,
        isFullscreen,
        toggleFullscreen,
        onOpenModalSettings,
        makeSmaller,
        makeBigger,
    } = props;

    return (
        <>
            <ConnectedAuthenticationButton />

            <Button
                {...EMainMenuProps[EMainMenuModalSelectors.FullScreenButton]}
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                onClick={toggleFullscreen}
            />
            <ConnectedNotificationsList />
            <ConnectedNetworkStatus />
            <SettingsButton onClick={onOpenModalSettings} />
            <Button
                {...EMainMenuProps[EMainMenuModalSelectors.NavBarModeButton]}
                type="text"
                icon={type === ENavType.Full ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
                title={type === ENavType.Full ? 'Compact menu' : 'Full menu'}
                onClick={type === ENavType.Full ? makeSmaller : makeBigger}
                loading={navTypeLoading}
            />
            {type === ENavType.Small ? (
                <Button
                    {...EMainMenuProps[EMainMenuModalSelectors.NavBarHideButton]}
                    type="text"
                    icon={<DoubleLeftOutlined />}
                    title="Hide menu"
                    onClick={makeSmaller}
                    loading={navTypeLoading}
                />
            ) : null}
        </>
    );
};

export function Nav(props: TNavProps): ReactElement {
    const {
        className,
        type = ENavType.Small,
        onTypeChange,
        onOpenModalSettings,
        children,
        flexLayoutControls,
        appSwitchControls,
        stageSwitchControls,
        timeZoneIndicator,
        singleTabMode,
        onExitSingleTabMode,
        onResetLayout,
        onResetToSavedLayout,
        layoutComponents,
        keepRestParams,
        navTypeLoading,
    } = props;

    const makeBigger = useFunction(() => {
        if (type === ENavType.Hidden) onTypeChange(ENavType.Small);
        if (type === ENavType.Small) onTypeChange(ENavType.Full);
    });
    const makeSmaller = useFunction(() => {
        if (type === ENavType.Full) onTypeChange(ENavType.Small);
        if (type === ENavType.Small) onTypeChange(ENavType.Hidden);
    });

    const ref = useRef(document.body);
    const [fullscreen, toggleFullscreen] = useToggle(false);
    const cbCloseFullscreen = useFunction(() => toggleFullscreen(false));
    const isFullscreen = useFullscreen(ref, fullscreen, { onClose: cbCloseFullscreen });

    const collapsed = type !== ENavType.Full;
    const childrenElement = useMemo(
        () => children?.({ type, collapsed }),
        [children, collapsed, type],
    );

    if (type === ENavType.Hidden) {
        return (
            <FloatButton.Group className={cnShowNavButton} trigger="hover" icon={<MenuOutlined />}>
                <FloatButton
                    icon={<DoubleRightOutlined />}
                    tooltip="Open menu"
                    onClick={
                        !navTypeLoading
                            ? type === ENavType.Hidden
                                ? makeBigger
                                : makeSmaller
                            : undefined
                    }
                />
                <FloatButton
                    onClick={onOpenModalSettings}
                    icon={<SettingOutlined />}
                    tooltip="Open settings"
                />
                {appSwitchControls && <WidgetAppSelect size="large" type="float" />}
                {stageSwitchControls && <ConnectedStageSwitch size="large" type="float" />}
                {childrenElement}
            </FloatButton.Group>
        );
    }

    return (
        <div
            className={cn(className, cnRoot[type])}
            {...EMainMenuProps[EMainMenuModalSelectors.MainMenuBar]}
        >
            <div className={cn(cnSection)}>
                {appSwitchControls && (
                    <WidgetAppSelect size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                )}
                {timeZoneIndicator && <WidgetTimeZoneInfo collapsed={collapsed} />}
            </div>
            {childrenElement}
            {flexLayoutControls && (
                <div className={cn(cnSection)}>
                    <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                    {!singleTabMode && layoutComponents && (
                        <ConnectedAddTabButton size="middle" components={layoutComponents}>
                            {collapsed ? null : 'Add tab'}
                        </ConnectedAddTabButton>
                    )}
                    {singleTabMode
                        ? !isNil(onExitSingleTabMode) && (
                              <Button
                                  title={collapsed ? 'Exit Single Tab mode' : undefined}
                                  icon={<FullscreenExitOutlined />}
                                  onClick={onExitSingleTabMode}
                              >
                                  {collapsed ? null : 'Exit Single Tab mode'}
                              </Button>
                          )
                        : !isNil(onResetLayout) &&
                          !isNil(onResetToSavedLayout) && (
                              <LayoutReset
                                  onResetToDefault={onResetLayout}
                                  onResetToSaved={onResetToSavedLayout}
                                  size="middle"
                                  type={collapsed ? 'icon' : 'icon-label'}
                              />
                          )}
                    <Divider type="horizontal" className={cnDivider} />
                    {stageSwitchControls && (
                        <ConnectedStageSwitch
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                            keepRestParams={keepRestParams}
                        />
                    )}
                </div>
            )}
            <div
                className={cn(cnSection, cnNavBottomFull, {
                    [cnSectionRow]: type === ENavType.Full,
                })}
            >
                <CollapsableNavigation
                    type={type}
                    navTypeLoading={navTypeLoading}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                    onOpenModalSettings={onOpenModalSettings}
                    makeSmaller={makeSmaller}
                    makeBigger={makeBigger}
                />
            </div>
            {type === ENavType.Small ? (
                <Popover
                    placement="rightBottom"
                    content={
                        <div className={cn(cnSection)}>
                            <CollapsableNavigation
                                type={type}
                                navTypeLoading={navTypeLoading}
                                isFullscreen={isFullscreen}
                                toggleFullscreen={toggleFullscreen}
                                onOpenModalSettings={onOpenModalSettings}
                                makeSmaller={makeSmaller}
                                makeBigger={makeBigger}
                            />
                        </div>
                    }
                >
                    <Button
                        className={cn(cnNavBottomCollapse)}
                        icon={<EllipsisOutlined />}
                    ></Button>
                </Popover>
            ) : null}
        </div>
    );
}

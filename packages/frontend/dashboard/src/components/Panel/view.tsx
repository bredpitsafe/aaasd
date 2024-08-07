import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CloseOutlined,
    DragOutlined,
    EditOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import {
    EDashboardPanelProps,
    EDashboardPanelSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.panel.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Divider } from '@frontend/common/src/components/Divider';
import { Space } from '@frontend/common/src/components/Space';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import type { TDragStartData } from '@frontend/common/src/hooks/useDragAndDrop/useDrag';
import { useDrag } from '@frontend/common/src/hooks/useDragAndDrop/useDrag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { Key, ReactElement, ReactNode, SyntheticEvent } from 'react';
import { cloneElement, useMemo, useRef } from 'react';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';

import type { TPanel } from '../../types/panel';
import { DRAGGABLE_HANDLE_CLASS_NAME } from '../DashboardGrid/Grid';
import { ConnectedExportButton } from '../Layout/components/ConnectedExportButton';
import { cnContent, cnLabel, cnPanel, cnRoot, cnTabBar, cnTabBarExtra, cnTabs } from './view.css';

export type TPanelTab = {
    name: string;
    icon?: ReactNode;
    child: ReactElement;
};

export type TPanelViewProps = TWithClassname & {
    panel?: TPanel;
    key?: Key;
    label?: string;
    tabs: TPanelTab[];
    compactMode?: boolean;
    showLabelsInCompactMode?: boolean;
    isFullscreen?: boolean;
    isDraggable?: boolean;
    isLegendCollapsed?: boolean;
    onDragStart?: () => undefined | TDragStartData;
    onDragEnd?: VoidFunction;
    onEdit?: VoidFunction;
    onFullscreen?: VoidFunction;
    onClose?: VoidFunction;
    onToggleLegendCollapse?: VoidFunction;
};
export function PanelView(props: TPanelViewProps): ReactElement | null {
    const portalNode = useMemo(() => {
        const node = createHtmlPortalNode();
        node.element.className = cnFit;
        return node;
    }, []);
    const mainTab = props.tabs[0];
    const content = cloneElement(mainTab.child, { className: cn(cnFit, cnContent) });
    const hideTabBar = props.compactMode && (isNil(props.label) || !props.showLabelsInCompactMode);

    const items: TabsProps['items'] = [
        {
            key: mainTab.name,
            label: mainTab.name,
            className: cnPanel,
            children: <OutPortal node={portalNode} />,
        },
        ...(hideTabBar ? [] : props.tabs.slice(1)).map((tab) => ({
            key: tab.name,
            label: tab.name,
            className: cnPanel,
            children: tab.child,
        })),
    ];

    const handleClose = useFunction((event: SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        props.onClose?.();
    });
    const handleEdit = useFunction((event: SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        props.onEdit?.();
    });

    const handleFullscreen = useFunction((event: SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        props.onFullscreen?.();
        // Remove focus after click to disable `active` state with blue outline
        buttonFullscreenRef.current?.blur();
    });

    const [dragRef, dragPreview] = useDrag<HTMLDivElement, HTMLDivElement>(props.onDragStart);
    const buttonFullscreenRef = useRef<HTMLElement>(null);

    const buttonsElement: ReactNode = (
        <>
            <Space.Compact block size="small">
                {props.onEdit && (
                    <Button
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelEditButton]}
                        key="editConf"
                        title="Edit panel configuration"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                    />
                )}

                {props.isDraggable ? (
                    <Button
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelHoldDragButton]}
                        key="drag"
                        title="Hold to drag panel"
                        className={DRAGGABLE_HANDLE_CLASS_NAME}
                        size="small"
                        icon={<DragOutlined />}
                    />
                ) : null}

                {props.panel ? (
                    <ConnectedExportButton
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelSettingsButton]}
                        ref={dragRef}
                        key="share"
                        title="Click to open share settings or hold to drag panel between dashboards"
                        size="small"
                        panel={props.panel}
                    />
                ) : null}

                {props.onFullscreen && (
                    <Button
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelFullscreenButton]}
                        ref={buttonFullscreenRef}
                        key="fullscreen"
                        title={
                            props.isFullscreen
                                ? 'Exit fullscreen mode (Esc)'
                                : 'Enter fullscreen mode'
                        }
                        size="small"
                        icon={
                            props.isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
                        }
                        onClick={handleFullscreen}
                    />
                )}

                {props.onToggleLegendCollapse && (
                    <Button
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelShowLegendButton]}
                        key="legend"
                        title={
                            props.isLegendCollapsed
                                ? 'Show multi-row legend'
                                : 'Show single-row legend'
                        }
                        size="small"
                        icon={props.isLegendCollapsed ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        onClick={props.onToggleLegendCollapse}
                    />
                )}
            </Space.Compact>

            {props.onClose && (
                <>
                    <Divider type="vertical" />
                    <Button
                        {...EDashboardPanelProps[EDashboardPanelSelectors.PanelDeleteButton]}
                        key="close"
                        title="Delete panel"
                        size="small"
                        shape="circle"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                    />
                </>
            )}
        </>
    );

    const renderTabBar: TabsProps['renderTabBar'] = useFunction((tabBarProps) => {
        if (hideTabBar) {
            return <></>;
        }

        const tabButtons = props.tabs.length
            ? props.tabs.map((tab) => {
                  const onClick = () => tabBarProps.onTabClick(tab.name);
                  return (
                      <Button
                          {...EDashboardPanelProps[EDashboardPanelSelectors.PanelButton]}
                          key={tab.name}
                          title={tab.name}
                          size="small"
                          icon={tab.icon}
                          disabled={tab.name === tabBarProps.activeKey}
                          onClick={onClick}
                      />
                  );
              })
            : null;

        return (
            <div className={cnTabBar}>
                <div className={cnLabel}>{props.label}</div>
                <div className={cnTabBarExtra}>
                    <Space.Compact block size="small">
                        {tabButtons}
                    </Space.Compact>
                    {tabButtons ? <Divider type="vertical" /> : null}
                    {tabBarProps.extra}
                </div>
            </div>
        );
    });

    return (
        <>
            <InPortal node={portalNode}>{content}</InPortal>
            <div ref={dragPreview} className={cnRoot}>
                <Tabs
                    {...DashboardPageProps[EDashboardPageSelectors.DashboardCard]}
                    renderTabBar={renderTabBar}
                    type="card"
                    className={cn(cnTabs, props.className)}
                    items={items}
                    tabBarExtraContent={buttonsElement}
                ></Tabs>
            </div>
        </>
    );
}

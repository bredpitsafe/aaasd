import { ClockCircleOutlined, FileAddOutlined } from '@ant-design/icons';
import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedAddTabButton } from '@frontend/common/src/components/AddTabButton/ConnectedAddTabButton';
import { Button } from '@frontend/common/src/components/Button';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { ConnectedNav as CommonNav } from '@frontend/common/src/components/Nav';
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
import type { TTimeZoneInfo } from '@frontend/common/src/types/time';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import cn from 'classnames';
import { ReactElement, useCallback, useMemo } from 'react';

import { layoutComponents } from '../../layouts';
import { RobotsListDialogButton } from '../RobotsList/dialog';

type TNavProps = TWithClassname & {
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
    onAddTaskTab: VoidFunction;
    openModalSettings: VoidFunction;
    timeZoneInfo: TTimeZoneInfo;
};

export function Nav({
    className,
    onAddTaskTab,
    onResetLayout,
    onResetToSaved,
    openModalSettings,
    timeZoneInfo,
}: TNavProps): ReactElement {
    const timeZoneName = useMemo(() => getTimeZoneFullName(timeZoneInfo), [timeZoneInfo]);

    const cbRenderChildren: TNavChildRenderFunction = useCallback(({ type, collapsed }) => {
        if (type === ENavType.Hidden) {
            return (
                <>
                    <ConnectedStageSwitch
                        size="large"
                        type="float"
                        settingsStoreName={EApplicationName.HerodotusTerminal}
                    />
                    <FloatButton
                        {...EMainMenuProps[EMainMenuModalSelectors.AddTaskButton]}
                        tooltip="New Task"
                        icon={<FileAddOutlined />}
                        onClick={onAddTaskTab}
                    />
                </>
            );
        }

        return (
            <>
                {collapsed ? (
                    <Tooltip title={timeZoneName} showArrow={false}>
                        <div className={cnTimeZoneIcon}>
                            <ClockCircleOutlined />
                        </div>
                    </Tooltip>
                ) : (
                    <div className={cnTimeZone}>{timeZoneName}</div>
                )}
                <div className={cn(cnSection, cnSectionFill)}>
                    <Button
                        {...EMainMenuProps[EMainMenuModalSelectors.AddTaskButton]}
                        title="Add Task"
                        icon={<FileAddOutlined />}
                        onClick={onAddTaskTab}
                    >
                        {collapsed ? null : 'New Task'}
                    </Button>
                    <RobotsListDialogButton
                        collapsed={collapsed}
                        timeZone={timeZoneInfo.timeZone}
                    />
                </div>
                <div className={cnSection}>
                    <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                    <ConnectedAddTabButton size="middle" components={layoutComponents}>
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
                        settingsStoreName={EApplicationName.HerodotusTerminal}
                    />
                </div>
            </>
        );
    }, []);

    return (
        <CommonNav
            className={className}
            appName={EApplicationName.HerodotusTerminal}
            onOpenModalSettings={openModalSettings}
        >
            {cbRenderChildren}
        </CommonNav>
    );
}

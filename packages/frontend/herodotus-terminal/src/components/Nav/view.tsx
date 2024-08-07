import { FileAddOutlined } from '@ant-design/icons';
import type { TTimeZoneInfo } from '@common/types';
import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { layoutComponents } from '../../layouts';
import { RobotsListDialogButton } from '../RobotsList/dialog';

type TNavProps = TWithClassname & {
    openModalSettings: VoidFunction;
    timeZoneInfo: TTimeZoneInfo;
    onAddTaskTab: VoidFunction;
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
};

export function Nav({
    className,
    openModalSettings,
    timeZoneInfo,
    onAddTaskTab,
    onResetLayout,
    onResetToSaved,
}: TNavProps): ReactElement {
    const cbRenderChildren: TNavChildRenderFunction = useCallback(({ type, collapsed }) => {
        if (type === ENavType.Hidden) {
            return (
                <>
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
            </>
        );
    }, []);

    return (
        <ConnectedNav
            flexLayoutControls
            stageSwitchControls
            appSwitchControls
            timeZoneIndicator
            layoutComponents={layoutComponents}
            className={className}
            onOpenModalSettings={openModalSettings}
            onResetLayout={onResetLayout}
            onResetToSavedLayout={onResetToSaved}
        >
            {cbRenderChildren}
        </ConnectedNav>
    );
}

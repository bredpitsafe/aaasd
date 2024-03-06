import { FileAddOutlined } from '@ant-design/icons';
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
import { cnDivider } from '@frontend/common/src/components/Nav/view.css';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithStyle } from '@frontend/common/src/types/components';
import { TWithClassname } from '@frontend/common/src/types/components';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import cn from 'classnames';
import { ReactElement, useCallback } from 'react';

import { layoutComponents } from '../../layouts';
import { TConnectedNavProps } from '../../widgets/WidgetNav';
import { cnSection, cnSectionFill } from './view.css';

type TNavProps = TWithClassname &
    TConnectedNavProps &
    TWithStyle & {
        openModalSettings: VoidFunction;
        onAddTaskTab: () => void;
    };

export function Nav({
    className,
    onAddTaskTab,
    onResetLayout,
    onResetToSaved,
    openModalSettings,
}: TNavProps): ReactElement {
    const cbRenderChildren: TNavChildRenderFunction = useCallback(
        ({ type, collapsed }) => {
            if (type === ENavType.Hidden) {
                return (
                    <>
                        <FloatButton
                            {...EMainMenuProps[EMainMenuModalSelectors.AddTaskButton]}
                            tooltip="New Task"
                            icon={<FileAddOutlined />}
                            onClick={onAddTaskTab}
                        />
                        <ConnectedStageSwitch
                            size="large"
                            type="float"
                            settingsStoreName={EApplicationName.BacktestingManager}
                        />
                    </>
                );
            }

            return (
                <>
                    <div className={cn(cnSection, cnSectionFill)}>
                        <Button
                            {...EMainMenuProps[EMainMenuModalSelectors.AddTaskButton]}
                            title="New Task"
                            icon={<FileAddOutlined />}
                            onClick={onAddTaskTab}
                        >
                            {collapsed ? null : 'New Task'}
                        </Button>
                    </div>
                    <div className={cn(cnSection)}>
                        <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                        <ConnectedAddTabButton size="middle" components={layoutComponents}>
                            {collapsed ? null : 'Add tab'}
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
                            settingsStoreName={EApplicationName.BacktestingManager}
                        />
                    </div>
                </>
            );
        },
        [onAddTaskTab, onResetLayout, onResetToSaved],
    );

    return (
        <CommonNav
            appName={EApplicationName.BacktestingManager}
            className={className}
            onOpenModalSettings={openModalSettings}
        >
            {cbRenderChildren}
        </CommonNav>
    );
}

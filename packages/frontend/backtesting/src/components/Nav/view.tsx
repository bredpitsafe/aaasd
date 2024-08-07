import { FileAddOutlined } from '@ant-design/icons';
import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { layoutComponents } from '../../layouts';
import type { TConnectedNavProps } from '../../widgets/WidgetNav';
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
    openModalSettings,
    onResetLayout,
    onResetToSaved,
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
                </>
            );
        },
        [onAddTaskTab],
    );

    return (
        <ConnectedNav
            flexLayoutControls
            appSwitchControls
            stageSwitchControls
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

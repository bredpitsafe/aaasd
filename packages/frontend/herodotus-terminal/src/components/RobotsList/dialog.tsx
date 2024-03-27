import { AppstoreOutlined } from '@ant-design/icons';
import {
    EHerodotusTerminalSelectors,
    HerodotusTerminalProps,
} from '@frontend/common/e2e/selectors/herodotus-terminal/herodotus-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Drawer } from '@frontend/common/src/components/Drawer';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import type { TimeZone } from '@frontend/common/src/types/time';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { useToggle } from 'react-use';

import { RobotsList } from './index';

type TRobotsListDialogProps = {
    collapsed: boolean;
    timeZone: TimeZone;
};

const drawerBodyStyle = { padding: 0 };
export function RobotsListDialogButton(props: TRobotsListDialogProps) {
    const [open, toggleOpen] = useToggle(false);

    const { getHerodotusRobots$ } = useModule(ModuleRobots);
    const robots$ = useMemo(() => getHerodotusRobots$(), []);
    const robots = useSyncObservable(robots$);

    if (isNil(robots)) {
        return null;
    }

    return (
        <>
            <Button
                {...HerodotusTerminalProps[EHerodotusTerminalSelectors.RobotsButton]}
                icon={<AppstoreOutlined />}
                title="Robots"
                onClick={toggleOpen}
            >
                {props.collapsed ? null : 'Select Robot'}
            </Button>
            <Drawer
                bodyStyle={drawerBodyStyle}
                title="Robots"
                placement="left"
                open={open}
                onClose={toggleOpen}
            >
                <RobotsList robots={robots} timeZone={props.timeZone} />
            </Drawer>
        </>
    );
}

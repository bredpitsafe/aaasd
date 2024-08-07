import { AppstoreOutlined } from '@ant-design/icons';
import type { TimeZone } from '@common/types';
import {
    EHerodotusTerminalSelectors,
    HerodotusTerminalProps,
} from '@frontend/common/e2e/selectors/herodotus-terminal/herodotus-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Drawer } from '@frontend/common/src/components/Drawer';
import { useHerodotusRobots } from '@frontend/trading-servers-manager/src/hooks/robot.ts';
import { isNil } from 'lodash-es';
import { useToggle } from 'react-use';

import { RobotsList } from './index';

type TRobotsListDialogProps = {
    collapsed: boolean;
    timeZone: TimeZone;
};

const drawerBodyStyle = { padding: 0 };
export function RobotsListDialogButton(props: TRobotsListDialogProps) {
    const [open, toggleOpen] = useToggle(false);

    const robots = useHerodotusRobots();

    if (isNil(robots.value)) {
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
                <RobotsList robots={robots.value} timeZone={props.timeZone} />
            </Drawer>
        </>
    );
}

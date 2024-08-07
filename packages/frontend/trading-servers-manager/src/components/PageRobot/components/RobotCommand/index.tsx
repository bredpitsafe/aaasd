import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { useRobotCommand } from '../../../../hooks/useRobotCommand';
import { RobotCommand } from './view';

export function ConnectedRobotCommand(): ReactElement {
    const robot = useCurrentRobot();
    const command = useRobotCommand(robot.value);

    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    if (command === undefined) {
        return (
            <Error
                status="warning"
                title="Sending robot commands is not allowed in the current state"
            />
        );
    }

    return <RobotCommand disabled={command.disabled} onSendCommand={command.sendCommand} />;
}

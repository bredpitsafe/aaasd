import type { TSettingsStoreName } from '@frontend/common/src/actors/Settings/db';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TimeZone } from '@frontend/common/src/types/time';
import { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { RobotStatusMessages } from './view';

export function ConnectedRobotStatusMessages({
    applicationName,
}: {
    applicationName: TSettingsStoreName;
}): ReactElement {
    const robot = useCurrentRobot();
    const [{ timeZone }] = useTimeZoneInfoSettings(applicationName);

    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    return <InnerConnectedRobotStatusMessages robot={robot} timeZone={timeZone} />;
}

function InnerConnectedRobotStatusMessages({
    robot,
    timeZone,
}: {
    robot: TRobot;
    timeZone: TimeZone;
}): ReactElement {
    const { statusMessageHistory } = usePageComponentMetadata(EComponentType.robot, robot.id);

    return <RobotStatusMessages statusMessageHistory={statusMessageHistory} timeZone={timeZone} />;
}

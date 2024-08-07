import type { TimeZone } from '@common/types';
import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { RobotStatusMessages } from './view';

export function ConnectedRobotStatusMessages(): null | ReactElement {
    const robot = useCurrentRobot();
    const [{ timeZone }] = useTimeZoneInfoSettings();

    switch (true) {
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot): {
            if (isNil(robot.value)) {
                return <Error status={404} />;
            } else {
                return (
                    <InnerConnectedRobotStatusMessages robot={robot.value} timeZone={timeZone} />
                );
            }
        }
        default:
            return null;
    }
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

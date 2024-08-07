import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { RobotTasks } from './view';

export type TConnectedRobotTasksProps = {
    tableId: ETableIds.ActiveTasks | ETableIds.ArchivedTasks;
};

export function ConnectedRobotTasks({ tableId }: TConnectedRobotTasksProps): ReactElement {
    const robot = useCurrentRobot();
    const isHero = useMemo(() => isHerodotus(robot.value), [robot.value]);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    if (isNil(robot.value)) {
        return <LoadingOverlay />;
    }

    if (!isHero) {
        return <Error status="warning" title="Robot doesn't support tasks" />;
    }

    return <RobotTasks tableId={tableId} robot={robot.value} timeZone={timeZone} />;
}

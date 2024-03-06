import type { TSettingsStoreName } from '@frontend/common/src/actors/Settings/db';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import { ReactElement, useMemo } from 'react';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { RobotTasks } from './view';

export type TConnectedRobotTasksProps = {
    applicationName: TSettingsStoreName;
    tableId: ETableIds.ActiveTasks | ETableIds.ArchivedTasks;
};

export function ConnectedRobotTasks({
    applicationName,
    tableId,
}: TConnectedRobotTasksProps): ReactElement {
    const robot = useCurrentRobot();
    const isHero = useMemo(() => isHerodotus(robot), [robot]);

    const [{ timeZone }] = useTimeZoneInfoSettings(applicationName);

    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    if (!isHero) {
        return <Error status="warning" title="Robot doesn't support tasks" />;
    }

    return <RobotTasks tableId={tableId} robot={robot} timeZone={timeZone} />;
}

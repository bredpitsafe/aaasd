import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useModule } from '../../di/react';
import type { TRobotDashboard } from '../../handlers/def';
import { ModuleBaseActions } from '../../modules/actions';
import type { TRobotId } from '../../types/domain/robots';
import type { ISO } from '../../types/time';
import { useSyncObservable } from '../../utils/React/useSyncObservable';

export function useRobotDashboardsList(
    robotId: TRobotId,
    snapshotDate: ISO | undefined,
): TRobotDashboard[] | undefined {
    const { subscribeRobotDashboardListUpdates, getRobotDashboardSnapshotList } =
        useModule(ModuleBaseActions);

    const dashboards$ = useMemo(
        () =>
            isNil(snapshotDate)
                ? subscribeRobotDashboardListUpdates([robotId])
                : getRobotDashboardSnapshotList(robotId, snapshotDate),
        [subscribeRobotDashboardListUpdates, getRobotDashboardSnapshotList, robotId, snapshotDate],
    );

    return useSyncObservable(dashboards$);
}

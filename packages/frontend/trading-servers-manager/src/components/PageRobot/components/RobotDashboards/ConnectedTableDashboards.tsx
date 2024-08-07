import type { ISO } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { TableDashboards } from '@frontend/common/src/components/Tables/TableDashboards/view';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToRobotDashboardsWithSnapshot } from '@frontend/common/src/modules/actions/robotDashboards/ModuleSubscribeToRobotDashboardsWithSnapshot.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { EDefaultLayoutComponents } from '../../../../layouts/default';
import { cnRoot } from './ConnectedTableDashboards.css';

export function ConnectedTableDashboards({
    className,
    robot,
}: TWithClassname & {
    robot: TRobot;
}): ReactElement | null {
    const subscribeToRobotDashboardsWithSnapshot = useModule(
        ModuleSubscribeToRobotDashboardsWithSnapshot,
    );

    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);

    const socketName = useSyncObservable(currentSocketName$);
    const socketUrl = useSyncObservable(currentSocketUrl$);
    const [snapshotDate, updateSnapshotDate] = useSyncedTableFilter<ISO>(
        ETableIds.Dashboards,
        'date',
    );

    const dashboards = useNotifiedValueDescriptorObservable(
        subscribeToRobotDashboardsWithSnapshot(
            socketUrl,
            { robotId: robot.id, platformTime: snapshotDate },
            { traceId: generateTraceId() },
        ),
    );

    const { upsertTabFrame } = useModule(ModuleLayouts);

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(EDefaultLayoutComponents.IndicatorsDashboard, name, url);
    });

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <div className={cn(cnRoot, className)}>
            <TableDashboards
                timeZone={timeZone}
                socketName={socketName}
                dashboards={dashboards?.value ?? undefined}
                onDashboardLinkClick={cbDashboardLinkClick}
                snapshotDate={snapshotDate}
                onChangeSnapshotDate={updateSnapshotDate}
            />
        </div>
    );
}

import { useRobotDashboardsList } from '@frontend/common/src/components/hooks/useRobotDashboardsList';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useSyncedTableFilter } from '@frontend/common/src/components/Table/helpers/useSyncedTableFilter';
import { TableDashboards } from '@frontend/common/src/components/Tables/TableDashboards/view';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { ISO } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import { ReactElement } from 'react';

import { EDefaultLayoutComponents } from '../../../../layouts/default';
import { cnRoot } from './ConnectedTableDashboards.css';

export function ConnectedTableDashboards({
    className,
    robot,
}: TWithClassname & {
    robot: TRobot;
}): ReactElement | null {
    const [snapshotDate, updateSnapshotDate] = useSyncedTableFilter<ISO>(
        ETableIds.Dashboards,
        'date',
    );

    const dashboards = useRobotDashboardsList(robot.id, snapshotDate);

    const { currentSocketName$ } = useModule(ModuleCommunication);

    const socketName = useSyncObservable(currentSocketName$);

    const { upsertTabFrame } = useModule(ModuleLayouts);

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(EDefaultLayoutComponents.IndicatorsDashboard, name, url);
    });

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    return (
        <div className={cn(cnRoot, className)}>
            <TableDashboards
                timeZone={timeZone}
                socketName={socketName}
                dashboards={dashboards}
                onDashboardLinkClick={cbDashboardLinkClick}
                snapshotDate={snapshotDate}
                onChangeSnapshotDate={updateSnapshotDate}
            />
        </div>
    );
}

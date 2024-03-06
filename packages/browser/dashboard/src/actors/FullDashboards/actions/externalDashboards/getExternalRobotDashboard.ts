import type { TContextRef } from '@frontend/common/src/di';
import type { TRobotDashboard } from '@frontend/common/src/handlers/def';
import { ModuleGetRobotDashboardResource } from '@frontend/common/src/handlers/getRobotDashboardHandle';
import { ModuleGetSnapshotRobotDashboardResource } from '@frontend/common/src/handlers/getSnapshotRobotDashboardHandle';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { ISO } from '@frontend/common/src/types/time';
import { ServerActionModuleFactory } from '@frontend/common/src/utils/ModuleFactories/ServerModuleFactory';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { from, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import type { TDashboard } from '../../../../types/dashboard';
import type { TImportableDashboard } from '../../../../types/dashboard/importable';
import { convertImportableJsonToDashboard } from '../../../../utils/dashboards/converters';

export function getExternalRobotDashboard(
    ctx: TContextRef,
    socketName: TSocketName,
    robotId: TRobotId,
    dashboardName: TRobotDashboard['name'],
    snapshotDate?: ISO,
    backtestingId?: TBacktestingRunId,
): Observable<TDashboard> {
    const traceId = generateTraceId();
    const { getSocket$ } = ModuleSocketList(ctx);
    const getRobotDashboard = ModuleGetRobotDashboardAction(ctx);
    const getSnapshotRobotDashboard = ModuleGetSnapshotRobotDashboardAction(ctx);

    return getSocket$(socketName).pipe(
        first(),
        switchMap((url) =>
            (isNil(snapshotDate)
                ? getRobotDashboard(
                      url,
                      { robotId, dashboardName, btRunNo: backtestingId },
                      { traceId },
                  )
                : getSnapshotRobotDashboard(
                      url,
                      {
                          robotId,
                          dashboardName,
                          platformTime: snapshotDate,
                          includeRaw: true,
                      },
                      { traceId },
                  )
            ).pipe(
                first(),
                switchMap((dashboardJson) => {
                    const parsedJSON = JSON.parse(dashboardJson) as TImportableDashboard;

                    return from(convertImportableJsonToDashboard(parsedJSON, { url }));
                }),
            ),
        ),
    );
}

const ModuleGetRobotDashboardAction = ServerActionModuleFactory(ModuleGetRobotDashboardResource)(
    () => ({
        extendPipe: (resource) => {
            return resource.pipe(map((envelope) => envelope.raw));
        },
    }),
);

const ModuleGetSnapshotRobotDashboardAction = ServerActionModuleFactory(
    ModuleGetSnapshotRobotDashboardResource,
)(() => ({
    extendPipe: (resource) => {
        return resource.pipe(
            map(({ dashboards }) => {
                if (isNil(dashboards) || dashboards.length === 0) {
                    throw new Error(`Robot dashboard doesn't exist`);
                }

                return dashboards[0].raw;
            }),
        );
    },
}));

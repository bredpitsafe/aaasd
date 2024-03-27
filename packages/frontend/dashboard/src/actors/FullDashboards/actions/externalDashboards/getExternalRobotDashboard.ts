import type { TContextRef } from '@frontend/common/src/di';
import type { TRobotDashboard } from '@frontend/common/src/handlers/def';
import { ModuleGetRobotDashboardHandler } from '@frontend/common/src/handlers/getRobotDashboardHandle';
import { ModuleGetSnapshotRobotDashboard } from '@frontend/common/src/handlers/getSnapshotRobotDashboardHandle';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { ISO } from '@frontend/common/src/types/time';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { from, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import type { TDashboard } from '../../../../types/dashboard';
import type { TImportableDashboard } from '../../../../types/dashboard/importable.ts';
import { convertImportableJsonToDashboard } from '../../../../utils/dashboards/converters.tsx';

export function getExternalRobotDashboard(
    ctx: TContextRef,
    socketName: TSocketName,
    robotId: TRobotId,
    dashboardName: TRobotDashboard['name'],
    snapshotDate?: ISO,
    backtestingId?: TBacktestingRunId,
): Observable<TValueDescriptor2<TDashboard>> {
    const traceId = generateTraceId();
    const { getSocket$ } = ModuleSocketList(ctx);
    const getRobotDashboard = ModuleGetRobotDashboardHandler(ctx);
    const getSnapshotRobotDashboard = ModuleGetSnapshotRobotDashboard(ctx);

    return getSocket$(socketName).pipe(
        first(),
        switchMap((url) =>
            (isNil(snapshotDate)
                ? getRobotDashboard(
                      { target: url, robotId, dashboardName, btRunNo: backtestingId },
                      { traceId },
                  ).pipe(
                      mapValueDescriptor(({ value }) => {
                          return createSyncedValueDescriptor(value.raw);
                      }),
                  )
                : getSnapshotRobotDashboard(
                      {
                          target: url,
                          robotId,
                          dashboardName,
                          platformTime: snapshotDate,
                          includeRaw: true,
                      },
                      { traceId },
                  ).pipe(
                      mapValueDescriptor(({ value }) => {
                          if (isNil(value.dashboards) || value.dashboards.length === 0) {
                              throw new Error(`Robot dashboard doesn't exist`);
                          }

                          return createSyncedValueDescriptor(value.dashboards[0].raw);
                      }),
                  )
            ).pipe(
                takeWhileFirstSyncValueDescriptor(),
                switchMapValueDescriptor(({ value: dashboardJson }) => {
                    const parsedJSON = JSON.parse(dashboardJson) as TImportableDashboard;

                    return from(convertImportableJsonToDashboard(parsedJSON, { url })).pipe(
                        map(createSyncedValueDescriptor),
                    );
                }),
            ),
        ),
    );
}

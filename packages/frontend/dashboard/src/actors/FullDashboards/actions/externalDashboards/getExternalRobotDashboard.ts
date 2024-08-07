import type { ISO } from '@common/types';
import { generateTraceId } from '@common/utils';
import type { TContextRef } from '@frontend/common/src/di';
import type { TRobotDashboard } from '@frontend/common/src/modules/actions/def.ts';
import { ModuleGetRobotDashboard } from '@frontend/common/src/modules/actions/robotDashboards/ModuleGetRobotDashboard.ts';
import { ModuleListRobotDashboards } from '@frontend/common/src/modules/actions/robotDashboards/ModuleListRobotDashboards.ts';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { from } from 'rxjs';
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
    const getRobotDashboard = ModuleGetRobotDashboard(ctx);
    const listRobotDashboards = ModuleListRobotDashboards(ctx);

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
                : listRobotDashboards(
                      {
                          target: url,
                          robotId,
                          dashboardName,
                          platformTime: snapshotDate,
                          includeRaw: true,
                      },
                      { traceId },
                  ).pipe(
                      mapValueDescriptor(({ value: dashboards }) => {
                          if (
                              isNil(dashboards) ||
                              isEmpty(dashboards) ||
                              isNil(dashboards[0].raw)
                          ) {
                              throw new Error(`Robot dashboard doesn't exist`);
                          }

                          return createSyncedValueDescriptor(dashboards[0].raw);
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

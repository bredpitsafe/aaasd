import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import type { TRobotDashboard } from '../../handlers/def';
import { getRobotDashboardSnapshotListHandle } from '../../handlers/getRobotDashboardSnapshotListHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TRobotId } from '../../types/domain/robots';
import type { TSocketURL } from '../../types/domain/sockets';
import type { ISO } from '../../types/time';
import { EMPTY_ARRAY } from '../../utils/const';
import { tapError } from '../../utils/Rx/tap';
import { shallowHash } from '../../utils/shallowHash';
import { logger } from '../../utils/Tracing';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';

export function getSnapshotRobotDashboardList(
    ctx: TContextRef,
    robotId: TRobotId,
    platformTime: ISO,
): Observable<TRobotDashboard[] | undefined> {
    const { request, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleNotifications(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => !isNil(url)),
        switchMap((url) =>
            getRobotDashboardSnapshotListHandle(request, url, robotId, platformTime).pipe(
                tapError((err: SocketStreamError) => {
                    const errorText = 'Error loading robot dashboards snapshot';

                    logger.error(`${errorText}: ${err.message}`);

                    error({
                        message: errorText,
                        description: err.message,
                        traceId: err.traceId,
                    });
                }),
                map(
                    ({ payload: { dashboards } }) =>
                        dashboards?.map((dashboard) => ({
                            ...dashboard,
                            id: shallowHash(dashboard.robotId, dashboard.name),
                        })) ?? EMPTY_ARRAY,
                ),
                startWith(undefined),
            ),
        ),
    );
}

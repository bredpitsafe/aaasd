import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { scan, switchMap } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import type { TRobotDashboard } from '../../handlers/def';
import { subscribeRobotDashboardListHandle } from '../../handlers/subscribeRobotDashboardListHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { TBacktestingRun } from '../../types/domain/backtestings';
import type { TRobotId } from '../../types/domain/robots';
import { TSocketURL } from '../../types/domain/sockets';
import { shallowHash } from '../../utils/shallowHash';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import { ModuleCommunication } from '../communication';
import { TStreamHandler } from '../communicationHandlers/def';
import { ModuleNotifications } from '../notifications/module';

/**
 * @deprecated
 */
export function subscribeRobotDashboardListUpdates(
    ctx: TContextRef,
    requestStream: TStreamHandler,
    url: TSocketURL,
    robotIds: TRobotId[],
    btRunId?: TBacktestingRun['btRunNo'],
): Observable<undefined | TRobotDashboard[]> {
    const { error } = ModuleNotifications(ctx);

    return subscribeRobotDashboardListHandle(requestStream, url, robotIds, btRunId).pipe(
        tap({
            error: (err: SocketStreamError) => {
                error({
                    message: `Robot dashboard subscription failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            },
        }),
        map(
            ({ payload: { dashboards } }) =>
                dashboards?.map((dashboard) => ({
                    ...dashboard,
                    id: shallowHash(dashboard.robotId, dashboard.name),
                    backtestingId: btRunId,
                })),
        ),
        scan((hash, dashboards) => {
            if (isNil(dashboards)) {
                return hash;
            }
            return hash.modify(dashboards);
        }, new UnifierWithCompositeHash<TRobotDashboard>('id')),
        map((hash) => hash.toArray()),
    );
}

export function subscribeCurrentRobotDashboardListUpdates(
    ctx: TContextRef,
    robotIds: TRobotId[],
    btRunId?: TBacktestingRun['btRunNo'],
): Observable<TRobotDashboard[] | undefined> {
    const { requestStream, currentSocketUrl$ } = ModuleCommunication(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            subscribeRobotDashboardListUpdates(ctx, requestStream, url, robotIds, btRunId).pipe(
                startWith(undefined),
            ),
        ),
    );
}

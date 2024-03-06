import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketURL } from '../types/domain/sockets';
import type { ISO } from '../types/time';
import { logger } from '../utils/Tracing';
import type { TRobotDashboard } from './def';
import { getTraceId } from './utils';

type TSendBody = {
    type: 'ListRobotDashboards';
    robotId: TRobotId;
    platformTime: ISO;
    includeRaw: boolean;
};

type TReceiveBody = {
    type: 'RobotDashboardList';
    dashboards?: TServerRobotDashboard[];
};

type TServerRobotDashboard = Omit<TRobotDashboard, 'id'>;

export function getRobotDashboardSnapshotListHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    robotId: TRobotId,
    platformTime: ISO,
    options?: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[getRobotDashboardSnapshotListHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'ListRobotDashboards',
            robotId,
            platformTime,
            includeRaw: false,
        },
        { ...options, traceId },
    ).pipe(take(1));
}

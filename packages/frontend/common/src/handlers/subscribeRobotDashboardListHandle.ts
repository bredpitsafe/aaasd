import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TStreamHandler } from '../modules/communicationHandlers/def';
import type { TBacktestingRun } from '../types/domain/backtestings';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TRobotDashboard,
    TSubscribed,
    TUnsubscribeSendBody,
} from './def';
import { convertSubscribedToEmptyUpdate, getTraceId, pollIntervalForRequest } from './utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToRobotDashboardList';
    robotIds: TRobotId[];
    btRunNo: undefined | TBacktestingRun['btRunNo'];
};

type TReceiveBody = {
    type: 'RobotDashboardList';
    dashboards?: TServerRobotDashboard[];
};

type TServerRobotDashboard = Omit<TRobotDashboard, 'id'>;

/**
 * @deprecated
 */
export function subscribeRobotDashboardListHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    robotIds: TRobotId[],
    backtestingRunId?: TBacktestingRun['btRunNo'],
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeRobotDashboardListHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeToRobotDashboardList',
                    robotIds,
                    btRunNo: backtestingRunId,
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    ).pipe(
        convertSubscribedToEmptyUpdate<TReceiveBody>(() => ({
            type: 'RobotDashboardList',
            dashboards: [],
        })),
    );
}

import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingTask } from '../../types/domain/backtestings';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'StopBacktestTask';
    id: TBacktestingTask['id'];
};

type TReceiveBody = {
    type: 'BacktestTaskStopped';
};

export function stopBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    id: TBacktestingTask['id'],
    options?: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[stopBacktestingRunHandle]: init observable', {
        traceId,
    });

    return fetch<TSendBody, TReceiveBody>(
        url,
        {
            type: 'StopBacktestTask',
            id,
        },
        { ...options, traceId },
    ).pipe(take(1));
}

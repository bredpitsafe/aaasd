import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TBacktestingTask } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'RemoveBacktestTask';
    id: TBacktestingTask['id'];
};

type TReceiveBody = {
    type: 'BacktestTaskRemoved';
};

export function deleteBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    id: TBacktestingTask['id'],
    options?: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[deleteBacktestingTaskHandle]: init observable', {
        traceId,
    });

    return fetch<TSendBody, TReceiveBody>(
        url,
        {
            type: 'RemoveBacktestTask',
            id,
        },
        { ...options, traceId },
    ).pipe(take(1));
}

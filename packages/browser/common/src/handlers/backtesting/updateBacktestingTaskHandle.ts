import type { Observable } from 'rxjs';

import type { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TBacktestingTask } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

export type TUpdateBacktestingTaskParams = Pick<
    TBacktestingTask,
    'id' | 'name' | 'description' | 'scoreIndicator'
>;

type TSendBody = TUpdateBacktestingTaskParams & {
    type: 'UpdateBacktestTask';
};

type TReceiveBody = {
    type: 'UpdatedBacktestTask';
};

export function updateBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    params: TUpdateBacktestingTaskParams,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[updateBacktestingTaskHandle]: init observable', {
        traceId,
    });

    return fetch<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateBacktestTask',
            ...params,
        },
        { ...options, traceId },
    );
}

import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'StartBacktestTask';
    id: number;
    startStopped: boolean;
};

type TReceiveBody = {
    type: 'StartedBacktestTask';
};

export function startBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    id: number,
    startStopped: boolean,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[startBacktestingTaskHandler]: init observable', {
        traceId,
    });

    return fetch<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        {
            type: 'StartBacktestTask',
            id,
            startStopped,
        },
        { ...options, traceId },
    );
}

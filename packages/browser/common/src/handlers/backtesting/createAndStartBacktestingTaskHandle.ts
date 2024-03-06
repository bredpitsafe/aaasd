import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler } from '../../modules/communicationHandlers/def';
import type {
    TBacktestingTask,
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TUnsubscribeSendBody, TWithTraceId } from '../def';
import { getTraceId } from '../utils';

type TSendBody = {
    type: 'CreateAndStartBacktestTask';
} & TBacktestingTaskCreateParams;

type TReceiveBody = {
    type: 'BacktestTaskStarted';
    id: TBacktestingTask['id'];
};

type TReceiveError = {
    type: 'ValidateBacktestTaskResult';
    errors: null | TValidationTemplateErrors[];
};

export function createAndStartBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    data: TBacktestingTaskCreateParams,
    options: THandlerStreamOptions & TWithTraceId,
): Observable<TReceivedData<TReceiveBody | TReceiveError>> {
    const traceId = getTraceId(options);

    logger.trace('[createAndStartBacktestingTaskHandle]: init observable', {
        traceId,
    });

    return fetch<TSendBody | TUnsubscribeSendBody, TReceiveBody | TReceiveError>(
        url,
        {
            ...data,
            type: 'CreateAndStartBacktestTask',
        },
        { ...options, traceId },
    );
}

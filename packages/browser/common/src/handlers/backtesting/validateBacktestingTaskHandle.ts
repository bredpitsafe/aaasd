import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TFetchHandler } from '../../modules/communicationHandlers/def';
import type {
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { THandlerStreamOptions, TUnsubscribeSendBody, TWithTraceId } from '../def';

type TSendBody = {
    type: 'ValidateBacktestTask';
} & Omit<TBacktestingTaskCreateParams, 'simulationData'>;

type TReceiveBody = {
    type: 'ValidateBacktestTaskResult';
    errors: null | TValidationTemplateErrors[];
};

export function validateBacktestingTaskHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    data: Omit<TBacktestingTaskCreateParams, 'simulationData'>,
    options: THandlerStreamOptions & TWithTraceId,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[validateBacktestingTaskHandle]: init observable', {
        traceId: options.traceId,
    });

    return fetch<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        {
            ...data,
            type: 'ValidateBacktestTask',
        },
        { ...options },
    );
}

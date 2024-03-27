import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import type { TBacktestingRun } from '../types/domain/backtestings';
import type { TComponentId } from '../types/domain/component';
import type { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import type { TComponentConfig, TWithTraceId } from './def';
import { getTraceId } from './utils';

type TSendBody<TId extends TComponentId> = {
    type: 'GetComponentConfig';
    id: TId;
    btRunNo?: TBacktestingRun['btRunNo'];
};

type TReceiveBody = TComponentConfig & {
    type: 'ComponentConfig';
};

export function getComponentConfigHandle<TId extends TComponentId>(
    handler: TFetchHandler,
    url: TSocketURL,
    componentId: TId,
    btRunNo: TBacktestingRun['btRunNo'],
    options: THandlerOptions & TWithTraceId,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[getComponentConfigHandle]: init', { traceId });

    return handler<TSendBody<TId>, TReceiveBody>(
        url,
        {
            type: 'GetComponentConfig',
            id: componentId,
            btRunNo,
        },
        { ...options, traceId },
    );
}

import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingRun } from '../../types/domain/backtestings';
import { TSocketURL } from '../../types/domain/sockets';
import { Nanoseconds } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';
import {
    changeBacktestingRunBreakTimeHandle,
    TChangeBacktestingRunBreakTimeReceiveBody,
} from './changeBacktestingRunBreakTimeHandle';

export function pauseBacktestingRunHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    id: TBacktestingRun['btRunNo'],
    options?: THandlerOptions,
): Observable<TReceivedData<TChangeBacktestingRunBreakTimeReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[pauseBacktestingRunHandle]: init observable', {
        traceId,
    });

    return changeBacktestingRunBreakTimeHandle(
        fetch,
        url,
        { id, breakTime: 0 as Nanoseconds },
        options,
    );
}

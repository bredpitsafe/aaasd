import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingRun } from '../../types/domain/backtestings';
import { TSocketURL } from '../../types/domain/sockets';
import { plus } from '../../utils/math';
import { milliseconds2nanoseconds, monthInMilliseconds } from '../../utils/time';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';
import {
    changeBacktestingRunBreakTimeHandle,
    TChangeBacktestingRunBreakTimeReceiveBody,
} from './changeBacktestingRunBreakTimeHandle';

const NEXT_YEAR_NS = milliseconds2nanoseconds(plus(Date.now(), monthInMilliseconds * 12));

export function resumeBacktestingRunHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    id: TBacktestingRun['btRunNo'],
    options?: THandlerOptions,
): Observable<TReceivedData<TChangeBacktestingRunBreakTimeReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[resumeBacktestingRunHandle]: init observable', {
        traceId,
    });

    return changeBacktestingRunBreakTimeHandle(
        fetch,
        url,
        { id, breakTime: NEXT_YEAR_NS },
        options,
    );
}

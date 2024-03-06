import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingRun } from '../../types/domain/backtestings';
import { TSocketURL } from '../../types/domain/sockets';
import { Nanoseconds } from '../../types/time';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';

export type TChangeBacktestingRunBreakTimeHandleProps = {
    btRunNo: TBacktestingRun['btRunNo'];
    breakTime: number;
};

type TSendBody = {
    type: 'ContinueBacktest';
    cycleRoundMode: 'Ceil';
    btRunNo: TBacktestingRun['btRunNo'];
    breakTime: Nanoseconds;
};

type TReceiveBody = {
    type: 'BacktestContinued';
};

export type TChangeBacktestingRunBreakTimeReceiveBody = TReceiveBody;

export function changeBacktestingRunBreakTimeHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    props: Pick<TSendBody, 'breakTime'> & { id: TBacktestingRun['btRunNo'] },
    options?: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[changeBacktestingRunBreakTimeHandle]: init observable', {
        traceId,
    });

    return fetch<TSendBody, TReceiveBody>(
        url,
        {
            type: 'ContinueBacktest',
            cycleRoundMode: 'Ceil',
            btRunNo: props.id,
            breakTime: props.breakTime,
        },
        { ...options, traceId },
    ).pipe(take(1));
}

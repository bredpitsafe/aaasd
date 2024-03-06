import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { SocketStreamError } from '../lib/SocketStream/SocketStreamError';
import type { TFetchHandler } from '../modules/communicationHandlers/def';
import type { TInstrument, TInstrumentId } from '../types/domain/instrument';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketURL } from '../types/domain/sockets';
import { tapError } from '../utils/Rx/tap';
import type { TraceId } from '../utils/traceId';
import { logger } from '../utils/Tracing';

type TSendBody = {
    type: 'GetHerodotusPreRiskData';
    robotId: TRobotId;
    instrumentId: TInstrumentId;
};

type TReceivedBody = {
    type: 'HerodotusPreRiskData';
    preRisk: {
        name: TInstrument['name'];
        maxOrderAmount: number;
        aggression: number;
        aggressionAmount: number;
    } | null;
};

export function getHerodotusPreRiskDataHandle(
    request: TFetchHandler,
    url: TSocketURL,
    robotId: TRobotId,
    instrumentId: TInstrumentId,
    traceId: TraceId,
): Observable<TReceivedData<TReceivedBody>> {
    logger.trace('[getHerodotusPreRiskDataHandle]: init observable', {
        traceId,
    });

    return request<TSendBody, TReceivedBody>(
        url,
        {
            type: 'GetHerodotusPreRiskData',
            robotId,
            instrumentId,
        },
        { traceId },
    ).pipe(
        take(1),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}

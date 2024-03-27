import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { SocketStreamError } from '../lib/SocketStream/SocketStreamError';
import type { TFetchHandler } from '../modules/communicationHandlers/def';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketURL } from '../types/domain/sockets';
import { tapError } from '../utils/Rx/tap';
import type { TraceId } from '../utils/traceId';
import { logger } from '../utils/Tracing';

type TSendBody = {
    type: 'GetHerodotusReferenceCurrency';
    robotId: TRobotId;
};

type TReceivedBody = {
    type: 'HerodotusReferenceCurrency';
    currency: string;
};

export function getHerodotusReferenceCurrencyHandle(
    request: TFetchHandler,
    url: TSocketURL,
    robotId: TRobotId,
    traceId: TraceId,
): Observable<TReceivedData<TReceivedBody>> {
    logger.trace('[getHerodotusReferenceCurrencyHandle]: init observable', {
        traceId,
    });

    return request<TSendBody, TReceivedBody>(
        url,
        {
            type: 'GetHerodotusReferenceCurrency',
            robotId,
        },
        { traceId },
    ).pipe(
        take(1),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}

import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { EErrorReason } from '../../lib/SocketStream/def';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TFetchHandler } from '../../modules/communicationHandlers/def';
import type { TBacktestingRun } from '../../types/domain/backtestings';
import type { TInstrumentId } from '../../types/domain/instrument';
import type { TSocketURL } from '../../types/domain/sockets';
import { EGrpcErrorCode } from '../../types/GrpcError';
import type { ISO } from '../../types/time';
import { tapError } from '../../utils/Rx/tap';
import { logger } from '../../utils/Tracing';
import type { TOrderBookFilter, TOrderBookUpdate, TOrderBookUpdateParams } from './defs';

type TSendBody = {
    type: 'FetchL2BookUpdates';
    filters: TOrderBookFilter;
    params: TOrderBookUpdateParams;
};

type TReceiveBody = {
    type: 'L2BookUpdates';
    updates: TOrderBookUpdate[];
};

/**
 * @deprecated
 */
export function getOrderBookUpdatesHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    instrumentId: TInstrumentId,
    platformTime: ISO,
    count: number,
    btRunNo?: TBacktestingRun['btRunNo'],
): Observable<TReceivedData<TReceiveBody>> {
    return fetch<TSendBody, TReceiveBody>(url, {
        type: 'FetchL2BookUpdates',
        filters: { instrumentId, platformTime, btRunNo },
        params: { count },
    }).pipe(
        take(1),
        map((envelope) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookUpdates', {
                    code: EGrpcErrorCode.UNKNOWN,
                    reason: EErrorReason.serverError,
                    traceId: envelope.traceId,
                    correlationId: envelope.correlationId,
                });
            }

            return envelope;
        }),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}

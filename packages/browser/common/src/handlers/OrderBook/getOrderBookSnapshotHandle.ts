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
import type { TOrderBookFilter, TOrderBookSnapshot, TOrderBookSnapshotParams } from './defs';

type TSendBody = {
    type: 'FetchL2BookSnapshot';
    filters: TOrderBookFilter;
    params: TOrderBookSnapshotParams;
};

type TReceiveBody = TOrderBookSnapshot & {
    type: 'L2BookSnapshot';
};

/**
 * @deprecated
 */
export function getOrderBookSnapshotHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    instrumentId: TInstrumentId,
    platformTime: ISO,
    depth: number,
    btRunNo?: TBacktestingRun['btRunNo'],
): Observable<TReceivedData<TReceiveBody>> {
    return fetch<TSendBody, TReceiveBody>(url, {
        type: 'FetchL2BookSnapshot',
        filters: { instrumentId, platformTime, btRunNo },
        params: { depth },
    }).pipe(
        take(1),
        map((envelope) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookSnapshot', {
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

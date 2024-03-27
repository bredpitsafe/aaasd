import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import type { TOrderBookSnapshot } from '../../../handlers/OrderBook/defs';
import { getOrderBookSnapshotHandle } from '../../../handlers/OrderBook/getOrderBookSnapshotHandle';
import type { TBacktestingRun } from '../../../types/domain/backtestings';
import type { TInstrumentId } from '../../../types/domain/instrument';
import type { TSocketURL } from '../../../types/domain/sockets';
import type { ISO } from '../../../types/time';
import { tapError } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleMessages } from '../../messages';

/**
 * @deprecated
 */
export function getOrderBookSnapshot(
    ctx: TContextRef,
    url: TSocketURL,
    instrumentId: TInstrumentId,
    platformTime: ISO,
    depth: number,
    btRunNo?: TBacktestingRun['btRunNo'],
): Observable<TOrderBookSnapshot> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const { error } = ModuleMessages(ctx);

    return getOrderBookSnapshotHandle(
        request,
        url,
        instrumentId,
        platformTime,
        depth,
        btRunNo,
    ).pipe(
        map(({ payload }) => payload),
        tapError(() => error('Could not load Order Book Snapshot')),
    );
}

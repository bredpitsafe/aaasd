import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import type { TOrderBookUpdate } from '../../../handlers/OrderBook/defs';
import { getOrderBookUpdatesHandle } from '../../../handlers/OrderBook/getOrderBookUpdatesHandle';
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
export function getOrderBookUpdates(
    ctx: TContextRef,
    url: TSocketURL,
    instrumentId: TInstrumentId,
    platformTime: ISO,
    count: number,
    btRunNo?: TBacktestingRun['btRunNo'],
): Observable<TOrderBookUpdate[]> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const { error } = ModuleMessages(ctx);

    return getOrderBookUpdatesHandle(request, url, instrumentId, platformTime, count, btRunNo).pipe(
        map(({ payload }) => payload.updates),
        tapError(() => error('Could not load Order Book Updates')),
    );
}

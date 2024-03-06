import { Observable } from 'rxjs';

import { requestOrdersItemsEnvBox } from '../../../actors/TradingServersManager/envelops';
import type { TContextRef } from '../../../di';
import { TFetchedOrdersSnapshotProps } from '../../../handlers/orders/fetchOrdersSnapshotHandle';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TActiveOrder } from '../../../types/domain/orders';
import type { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { ModuleActor } from '../../actor';
import { THandlerOptions } from '../../communicationHandlers/def';
import { ModuleNotifications } from '../../notifications/module';

export function getOrders(
    ctx: TContextRef,
    url: TSocketURL,
    props: TFetchedOrdersSnapshotProps,
    options: THandlerOptions,
): Observable<TActiveOrder[]> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return requestOrdersItemsEnvBox
        .request(actor, {
            url,
            props,
            options,
        })
        .pipe(
            tapError((err: SocketStreamError) => {
                error({
                    message: `Fetch orders failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
        );
}

import { Observable } from 'rxjs';

import { subscribeToOrdersUpdatesEnvBox } from '../../../actors/TradingServersManager/envelops';
import type { TContextRef } from '../../../di';
import { TFetchedOrdersSnapshotProps } from '../../../handlers/orders/fetchOrdersSnapshotHandle';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TActiveOrder } from '../../../types/domain/orders';
import type { TSocketURL } from '../../../types/domain/sockets';
import { TSubscriptionEvent } from '../../../utils/Rx/subscriptionEvents';
import { tapError } from '../../../utils/Rx/tap';
import { ModuleActor } from '../../actor';
import { THandlerOptions } from '../../communicationHandlers/def';
import { ModuleNotifications } from '../../notifications/module';

export function subscribeToOrders(
    ctx: TContextRef,
    url: TSocketURL,
    props: Omit<TFetchedOrdersSnapshotProps, 'limit' | 'offset'>,
    options: THandlerOptions,
): Observable<TSubscriptionEvent<TActiveOrder[]>> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return subscribeToOrdersUpdatesEnvBox
        .requestStream(actor, {
            url,
            props,
            options,
        })
        .pipe(
            tapError((err: SocketStreamError) => {
                error({
                    message: `Orders subscription failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
        );
}

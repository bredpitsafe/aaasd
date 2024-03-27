import { Observable } from 'rxjs';

import { subscribeToProductLogUpdatesEnvBox } from '../../../actors/InfinityHistory/envelope';
import { TProductLog, TProductLogSubscriptionFilters } from '../../../handlers/productLogs/defs';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TSocketURL } from '../../../types/domain/sockets';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { TSubscriptionEvent } from '../../../utils/Rx/subscriptionEvents';
import { tapError } from '../../../utils/Rx/tap';
import { logger } from '../../../utils/Tracing';
import { IModuleActor } from '../../actor';
import { THandlerOptions } from '../../communicationHandlers/def';
import type { IModuleNotifications } from '../../notifications/def';

type TContext = { actor: IModuleActor; notifications: IModuleNotifications };

export function subscribeToProductLogUpdatesUnbound(
    { actor, notifications }: TContext,
    url: TSocketURL,
    filters: TProductLogSubscriptionFilters,
    options: THandlerOptions,
): Observable<TSubscriptionEvent<TProductLog[]>> {
    logger.trace('[subscribeToProductLogUpdatesUnbound]', {
        actorName: actor.name,
        url,
        filters,
        options,
    });

    return subscribeToProductLogUpdatesEnvBox
        .requestStream(actor, {
            url,
            filters,
            options,
        })
        .pipe(
            tapError((err: SocketStreamError) => {
                notifications.error({
                    message: `Products logs subscription failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
            progressiveRetry(),
        );
}

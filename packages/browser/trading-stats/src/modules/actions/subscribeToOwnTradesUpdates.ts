import { subscribeToOwnTradeUpdatesEnvBox } from '@frontend/common/src/actors/InfinityHistory/envelope';
import { TContextRef } from '@frontend/common/src/di';
import type { TFetchOwnTradesFilters } from '@frontend/common/src/handlers/ownTrades/fetchOwnTradesHandle';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import type { THandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TOwnTrade } from '@frontend/common/src/types/domain/ownTrades';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TimeZone } from '@frontend/common/src/types/time';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { TSubscriptionEvent } from '@frontend/common/src/utils/Rx/subscriptionEvents';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export function subscribeToOwnTradesUpdates(
    ctx: TContextRef,
    filters: TFetchOwnTradesFilters,
    timeZone: TimeZone,
    options: THandlerOptions,
): Observable<TSubscriptionEvent<TOwnTrade[]>> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);
    const { currentSocketUrl$ } = ModuleCommunication(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            subscribeToOwnTradeUpdatesEnvBox.requestStream(actor, {
                url,
                filters,
                timeZone,
                options,
            }),
        ),
        tapError((err: SocketStreamError) => {
            error({
                message: `Daily trades list subscription failed`,
                description: err.message,
                timestamp: getNowMilliseconds(),
                traceId: err.traceId,
            });
        }),
        progressiveRetry(),
    );
}

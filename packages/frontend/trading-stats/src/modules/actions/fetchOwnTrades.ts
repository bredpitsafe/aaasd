import { requestOwnTradeItemsEnvBox } from '@frontend/common/src/actors/InfinityHistory/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import type { TFetchHistoryParams } from '@frontend/common/src/handlers/def';
import type { TFetchOwnTradesFilters } from '@frontend/common/src/handlers/ownTrades/fetchOwnTradesHandle';
import type { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { THandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TOwnTrade } from '@frontend/common/src/types/domain/ownTrades';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TimeZone } from '@frontend/common/src/types/time';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { Observable } from 'rxjs';

export function fetchOwnTrades(
    ctx: TContextRef,
    url: TSocketURL,
    params: TFetchHistoryParams,
    filters: TFetchOwnTradesFilters,
    timeZone: TimeZone,
    options: THandlerOptions,
): Observable<TOwnTrade[]> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return requestOwnTradeItemsEnvBox
        .request(actor, {
            url,
            params,
            timeZone,
            filters,
            options,
        })
        .pipe(
            tapError((err: SocketStreamError) => {
                error({
                    message: `Trades list fetch failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
        );
}

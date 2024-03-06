import { requestOwnTradeItemsEnvBox } from '@frontend/common/src/actors/InfinityHistory/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import type { TFetchHistoryParams } from '@frontend/common/src/handlers/def';
import type { TFetchOwnTradesFilters } from '@frontend/common/src/handlers/ownTrades/fetchOwnTradesHandle';
import type { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { THandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TOwnTrade } from '@frontend/common/src/types/domain/ownTrades';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TimeZone } from '@frontend/common/src/types/time';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { first, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export function fetchOwnTrades(
    ctx: TContextRef,
    params: TFetchHistoryParams,
    filters: TFetchOwnTradesFilters,
    timeZone: TimeZone,
    options: THandlerOptions,
): Observable<TOwnTrade[]> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            requestOwnTradeItemsEnvBox
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
                ),
        ),
    );
}

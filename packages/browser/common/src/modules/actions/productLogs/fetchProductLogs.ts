import { Observable } from 'rxjs';

import { requestProductLogItemsEnvBox } from '../../../actors/InfinityHistory/envelope';
import type { TFetchHistoryParams } from '../../../handlers/def';
import type { TProductLog, TProductLogFilters } from '../../../handlers/productLogs/defs';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { logger } from '../../../utils/Tracing';
import { IModuleActor } from '../../actor';
import { THandlerOptions } from '../../communicationHandlers/def';
import type { IModuleNotifications } from '../../notifications/def';

type TFetchProductLogsContext = {
    actor: IModuleActor;
    notifications: IModuleNotifications;
};

export function fetchProductLogsUnbound(
    { actor, notifications }: TFetchProductLogsContext,
    url: TSocketURL,
    params: TFetchHistoryParams,
    filters: TProductLogFilters,
    options: THandlerOptions,
): Observable<TProductLog[]> {
    logger.trace('[fetchProductLogsUnbound]', {
        actorName: actor.name,
        url,
        filters,
        options,
    });

    return requestProductLogItemsEnvBox
        .request(actor, {
            url,
            params,
            filters,
            options,
        })
        .pipe(
            tapError((err: SocketStreamError) => {
                notifications.error({
                    message: `Products logs fetch failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
        );
}

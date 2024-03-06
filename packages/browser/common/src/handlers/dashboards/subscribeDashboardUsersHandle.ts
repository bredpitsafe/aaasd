import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { THandlerOptions, TStreamHandler } from '../../modules/communicationHandlers/def';
import type { TUserName } from '../../modules/user';
import type { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import type { TRequestStreamOptions, TUnsubscribeSendBody } from '../def';
import { getTraceId } from '../utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeToUsers';
};

type TReceiveBody = {
    type: 'UsersList';
    list: { user: TUserName }[];
};

export function subscribeDashboardUsersHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeDashboardUsersHandle]: init observable', { traceId, url });

    return handler<TSendBody | TUnsubscribeSendBody, TReceiveBody>(
        url,
        () => [{ type: 'SubscribeToUsers' }, { type: 'Unsubscribe' }],
        { ...options, traceId },
    );
}

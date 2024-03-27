import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import {
    subscribeComponentUpdatesHandle,
    TComponentUpdatePayload,
} from '../../handlers/subscribeComponentUpdatesHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { TSocketURL } from '../../types/domain/sockets';
import { toMilliseconds } from '../../utils/time';
import { TStreamHandler } from '../communicationHandlers/def';
import { ModuleNotifications } from '../notifications/module';

/**
 * @deprecated
 */
export function subscribeComponentUpdates(
    ctx: TContextRef,
    requestStream: TStreamHandler,
    url: TSocketURL,
): Observable<TComponentUpdatePayload> {
    const { error } = ModuleNotifications(ctx);

    return subscribeComponentUpdatesHandle(requestStream, url, {
        pollInterval: toMilliseconds(1000),
    }).pipe(
        tap({
            error: (err: SocketStreamError) => {
                error({
                    message: `Components subscription failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            },
        }),
        map((envelope) => envelope.payload),
    );
}

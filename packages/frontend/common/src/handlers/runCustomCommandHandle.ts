import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { TCustomCommandPayload } from '../modules/actions/runCustomCommand';
import { THandlerOptions, TStreamHandler } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { generateTraceId } from '../utils/traceId';
import { logger } from '../utils/Tracing';
import { TUnsubscribeSendBody } from './def';

type TBody = TCustomCommandPayload;
export function runCustomCommandHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    payload: TBody,
    options?: Omit<THandlerOptions, 'traceId'>,
): Observable<TReceivedData<TBody>> {
    const traceId = generateTraceId();

    logger.trace('[RunCustomCommand]: init observable', {
        traceId,
    });

    return handler<TBody | TUnsubscribeSendBody, TBody>(
        url,
        () => {
            return [payload, { type: 'Unsubscribe' }];
        },
        {
            traceId,
            ...options,
        },
    );
}

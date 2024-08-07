import type { Observable } from 'rxjs';

import { ModuleFactory } from '../../di';
import type { TReceivedData } from '../../lib/BFFSocket/def.ts';
import type { TSocketStruct, TSocketURL, TWithSocketTarget } from '../../types/domain/sockets';
import type { TStructurallyCloneable } from '../../types/serialization';
import { logger } from '../../utils/Tracing';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import type { THandlerOptions, TStreamHandler } from '../communicationHandlers/def';
import type { TUnsubscribeSendBody, TWithTraceId } from './def.ts';

export type TCustomCommandPayload = {
    type: string;
    [key: string]: TStructurallyCloneable;
};

export const ModuleRunCustomCommand = ModuleFactory((ctx) => {
    const { requestStream } = ModuleCommunicationHandlers(ctx);

    return (
        params: TWithSocketTarget & {
            payload: TCustomCommandPayload;
        },
        options: TWithTraceId,
    ) => {
        return runCustomCommandHandle(requestStream, params.target, params.payload, {
            traceId: options.traceId,
            retries: 0,
            retryOnReconnect: false,
        });
    };
});

function runCustomCommandHandle(
    handler: TStreamHandler,
    url: TSocketURL | TSocketStruct,
    payload: TCustomCommandPayload,
    options: Omit<THandlerOptions, 'traceId'> & TWithTraceId,
): Observable<TReceivedData<TCustomCommandPayload>> {
    logger.trace('[RunCustomCommand]: init observable', url, payload, options);

    return handler<TCustomCommandPayload | TUnsubscribeSendBody, TCustomCommandPayload>(
        url,
        () => [payload, { type: 'Unsubscribe' }],
        options,
    );
}

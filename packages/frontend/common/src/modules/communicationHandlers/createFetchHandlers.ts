import { generateTraceId, iso2milliseconds } from '@common/utils';
import { isUndefined } from 'lodash-es';
import { forkJoin, from, identity, mergeMap, Observable, pipe } from 'rxjs';
import { filter, finalize, map, switchMap } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import type { BFFSocket } from '../../lib/BFFSocket/BFFSocket';
import type { TReceivedData, TSendPayload } from '../../lib/BFFSocket/def';
import { createSocketStream } from '../../lib/SocketStream';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import type { TStructurallyCloneableObject } from '../../types/serialization';
import { isAuthRequiredSocket } from '../../utils/url';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import { ModuleRemoteMetrics } from '../metrics/remote';
import { getNotificationsModule } from '../notifications/dynamicModule';
import type { ISocketBank } from '../Socket';
import { ModuleSocket } from '../Socket';
import type { TFetchHandler, THandlerOptions, TRequiredHandlerOptions, TStreamSender } from './def';
import { DEFAULT_OPTIONS } from './def';
import { createMeasureFirstResponse } from './operators/createMeasureFirstResponse';
import { logErrorOperator } from './operators/logError';
import { logSendEnvelope } from './operators/logSendEnvelope';
import { notifyErrorOperator } from './operators/notifyError';
import { retryOperator } from './operators/retryOperator';
import { timeoutOperator } from './operators/timeoutOperator';
import { traceFirstReceiveChunkOperator } from './operators/traceFirstReceiveChunkOperator';
import { traceFirstReceiveEnvelopeOperator } from './operators/traceFirstReceiveEnvelope';
import { waitSocket$ } from './operators/waitSocket$';
import { createEnvelope, generateCorrelationId, ModuleGetSocketStruct } from './utils';

export function createFetchHandlers(ctx: TContextRef) {
    const _update = createHandler(ctx, EActionTypeHandler.update);
    const _request = createHandler(ctx, EActionTypeHandler.request);
    const update: TFetchHandler = (url, body, options) => _update(url, () => [body], options);
    const request: TFetchHandler = (url, body, options) => _request(url, () => [body], options);
    const requestStream = createHandler(ctx, EActionTypeHandler.requestStream);

    return {
        update,
        request,
        requestStream,
    };
}

export enum EActionTypeHandler {
    update = 'update',
    request = 'request',
    requestStream = 'requestStream',
}

function createHandler(ctx: TContextRef, type: EActionTypeHandler) {
    const { socketBank } = ModuleSocket(ctx);
    const getSocketStruct$ = ModuleGetSocketStruct(ctx);
    const { collectTimeToResponse } = ModuleRemoteMetrics(ctx);

    return <
        SendBody extends TSendPayload,
        ReceiveBody extends TStructurallyCloneableObject,
        EnableVD extends boolean = false,
    >(
        target: TSocketURL | TSocketStruct,
        _sender: TStreamSender<SendBody>,
        _options?: THandlerOptions & { enableVD?: EnableVD },
    ): Observable<
        EnableVD extends true
            ? TValueDescriptor2<TReceivedData<ReceiveBody>>
            : TReceivedData<ReceiveBody>
    > => {
        return forkJoin([getSocketStruct$(target), from(getNotificationsModule(ctx))]).pipe(
            mergeMap(([socketStruct, notification]) => {
                const enableVD = _options?.enableVD ?? false;
                const options = getOptions(type, socketStruct, _options);
                const { initFirstResponse, measureFirstResponseOperator } =
                    createMeasureFirstResponse(socketStruct.url, collectTimeToResponse);

                const bodies = _sender();
                const correlationId = generateCorrelationId();
                const requestEnvelope = createEnvelope(bodies[0], options.traceId, correlationId);
                const closeEnvelope = isUndefined(bodies[1])
                    ? undefined
                    : createEnvelope(bodies[1], options.traceId, correlationId);

                options.enableLogs &&
                    initFirstResponse(iso2milliseconds(requestEnvelope.timestamp));
                options.enableLogs && logSendEnvelope(socketStruct.url, requestEnvelope);

                return borrowSocket$(socketBank, socketStruct).pipe(
                    switchMap((socket) => waitSocket$(socket, options)),
                    switchMap((socket) => {
                        return createSocketStream<SendBody, ReceiveBody>(
                            socket,
                            requestEnvelope,
                            closeEnvelope,
                            options,
                        ).pipe(
                            options.waitForResponse
                                ? pipe(
                                      // ValueDescriptor is received here (depending on `meta` state).
                                      traceFirstReceiveChunkOperator(
                                          socketStruct.url,
                                          requestEnvelope.payload.type,
                                      ),
                                      traceFirstReceiveEnvelopeOperator(
                                          socketStruct.url,
                                          requestEnvelope.payload.type,
                                      ),
                                      measureFirstResponseOperator(),
                                      // Timeout if we haven't received ANY kind of message from socket
                                      // (e.g. neither chunk or message data)
                                      timeoutOperator(socketStruct.url, requestEnvelope, options),
                                  )
                                : identity,
                        );
                    }),
                    //  Logger
                    options.enableLogs ? logErrorOperator(requestEnvelope) : identity,

                    // Finalize
                    // This operator should be before any retry operator
                    releaseSocketOnFinalizeOperator(socketBank, socketStruct.url),

                    // Retry
                    options.enableRetries ? retryOperator(options) : identity,

                    // TODO: remove notification from here
                    // Notifications
                    !enableVD && notification ? notifyErrorOperator(notification) : identity,
                    !enableVD ? filter(isSyncedValueDescriptor) : identity,
                    !enableVD ? map((v) => v.value as any) : identity,
                );
            }),
        );
    };
}

function borrowSocket$(socketBank: ISocketBank, socket: TSocketStruct): Observable<BFFSocket> {
    return new Observable((subscriber) => {
        subscriber.next(socketBank.borrow(socket).value);
        subscriber.complete();
    });
}

function releaseSocketOnFinalizeOperator<T>(socketBank: ISocketBank, url: TSocketURL) {
    return finalize<T>(() => socketBank.release(url));
}

export function getOptions(
    type: EActionTypeHandler,
    socket: TSocketStruct,
    options?: THandlerOptions,
): TRequiredHandlerOptions {
    const typedOptions =
        type === EActionTypeHandler.update
            ? {
                  ...options,
                  retries: 0,
                  enableRetries: false,
                  retryOnReconnect: false,
              }
            : options;

    return {
        ...DEFAULT_OPTIONS,
        ...typedOptions,
        skipAuthentication: options?.skipAuthentication ?? !isAuthRequiredSocket(socket.name),
        traceId: options?.traceId ?? generateTraceId(),
    };
}

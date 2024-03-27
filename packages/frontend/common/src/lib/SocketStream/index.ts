import { isObject } from 'lodash-es';
import { fromEvent, merge, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { TUnsubscribe } from '../../handlers/def';
import { DEFAULT_OPTIONS } from '../../modules/communicationHandlers/def';
import type { Assign } from '../../types';
import { TSocketURL } from '../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../types/GrpcError';
import { TStructurallyCloneableObject } from '../../types/serialization';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    LOADING_VD,
    RECEIVING_VD,
} from '../../utils/ValueDescriptor/utils';
import type { BFFSocket, TPartialMeta } from '../BFFSocket/BFFSocket';
import {
    EHeaderState,
    TReceivedData,
    TReceivedEnvelope,
    TSendEnvelope,
    TSendPayload,
} from '../BFFSocket/def';
import { EErrorReason, TSocketStreamOptions, TUnspecified } from './def';
import { SocketStreamError } from './SocketStreamError';

export function createSocketStream<
    SendBody extends TSendPayload,
    ReceiveBody extends TStructurallyCloneableObject,
>(
    socket: BFFSocket,
    requestBody: TSendEnvelope<SendBody>,
    closeBody: TSendEnvelope<TUnsubscribe> | undefined,
    _options: TSocketStreamOptions,
) {
    const options: Assign<TSocketStreamOptions, typeof DEFAULT_OPTIONS> = {
        ...DEFAULT_OPTIONS,
        ..._options,
    };

    return new Observable<TValueDescriptor2<TReceivedData<ReceiveBody>>>((subscriber) => {
        let correlationId = 0;
        const setCorrelationId = (request: TSendEnvelope<SendBody>) => {
            correlationId = request.correlationId;
        };

        const sendMessage = (envelope: TSendEnvelope<SendBody | TUnsubscribe>): void => {
            socket.send(envelope);
        };

        const onAbort = (event: Event | CloseEvent) => {
            if (!subscriber.closed) {
                const args =
                    event instanceof CloseEvent
                        ? {
                              closeEvent: {
                                  type: event.type,
                                  code: event.code,
                                  reason: event.reason,
                              },
                          }
                        : {
                              errorEvent: {
                                  type: event.type,
                              },
                          };

                subscriber.error(
                    new SocketStreamError('Websocket closed', {
                        code: EGrpcErrorCode.UNKNOWN,
                        reason: EErrorReason.socketClose,
                        traceId: options.traceId,
                        correlationId,
                        args,
                        socketURL: socket.url.href as TSocketURL,
                    }),
                );
            }
        };

        const abortSub = merge(
            fromEvent(socket, 'error') as Observable<Event>,
            fromEvent(socket, 'close') as Observable<CloseEvent>,
            fromEvent(socket, 'closing') as Observable<CloseEvent>,
        ).subscribe(onAbort);

        setCorrelationId(requestBody);
        sendMessage(requestBody);
        subscriber.next(LOADING_VD);

        if (options.waitForResponse === false) {
            return () => {
                abortSub.unsubscribe();
            };
        }

        const receiveMessage = (envelope: TReceivedEnvelope<TUnspecified | ReceiveBody>) => {
            if ('error' in envelope) {
                subscriber.error(
                    new SocketStreamError(envelope.error.description, {
                        code: envelope.error.code ?? EGrpcErrorCode.UNKNOWN,
                        reason: EErrorReason.serverError,
                        kind: envelope.error.kind,
                        args: envelope.error.args,
                        traceId: envelope.traceId,
                        correlationId: envelope.correlationId,
                        socketURL: socket.url.href as TSocketURL,
                    }),
                );
            }

            if ('payload' in envelope) {
                subscriber.next(
                    createSyncedValueDescriptor(envelope as TReceivedData<ReceiveBody>),
                );
            }

            if (
                envelope.state === EHeaderState.Done ||
                envelope.state === EHeaderState.Aborted ||
                envelope.state === EHeaderState.LimitReached
            ) {
                subscriber.complete();
            }
        };

        const partialSub = fromEvent(socket, 'partial')
            .pipe(filter(isSuitableMessage<TPartialMeta>(correlationId)), take(1))
            .subscribe(() => {
                subscriber.next(RECEIVING_VD);
            });

        const receiveEnvelopeSub = fromEvent(socket, 'envelope')
            .pipe(filter(isSuitableMessage<TReceivedEnvelope<ReceiveBody>>(correlationId)))
            .subscribe(receiveMessage);

        return () => {
            closeBody && socket.isOpened() && sendMessage(closeBody);
            abortSub.unsubscribe();
            receiveEnvelopeSub.unsubscribe();
            partialSub.unsubscribe();
        };
    });
}

const isSuitableMessage =
    <T extends { correlationId: number }>(correlationId: number) =>
    (envelope: unknown): envelope is T => {
        return (
            isObject(envelope) &&
            'correlationId' in envelope &&
            correlationId === envelope.correlationId
        );
    };

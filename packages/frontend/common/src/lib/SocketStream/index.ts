import type { Assign, Milliseconds } from '@common/types';
import type { TStructurallyCloneableObject } from '@common/types/src/serialization.ts';
import { isObject } from 'lodash-es';
import { fromEvent, merge, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import type { TUnsubscribe } from '../../modules/actions/def.ts';
import { DEFAULT_OPTIONS } from '../../modules/communicationHandlers/def';
import type { TSocketURL } from '../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../types/GrpcError';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    RECEIVING_VD,
    REQUESTING_VD,
} from '../../utils/ValueDescriptor/utils';
import type { BFFSocket, TPartialMeta } from '../BFFSocket/BFFSocket';
import type {
    TReceivedData,
    TReceivedEnvelope,
    TSendEnvelope,
    TSendPayload,
} from '../BFFSocket/def';
import { EHeaderState } from '../BFFSocket/def';
import type { TSocketStreamOptions, TUnspecified } from './def';
import { EErrorReason } from './def';
import { SocketStreamError } from './SocketStreamError';

const JITTER_GROUPS = 20;
const JITTER_INTERVAL = 16 as Milliseconds;

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

                macroTasks.addTimeout(
                    () =>
                        subscriber.error(
                            new SocketStreamError('Websocket closed', {
                                code: EGrpcErrorCode.UNKNOWN,
                                reason: EErrorReason.socketClose,
                                traceId: options.traceId,
                                correlationId,
                                args,
                                socketURL: socket.url.href as TSocketURL,
                            }),
                        ),
                    // Error flushing with jitter to prevent simultaneous error notifications across all subscriptions
                    Math.trunc(Math.random() * JITTER_GROUPS) * JITTER_INTERVAL,
                );
            }
        };

        setCorrelationId(requestBody);
        sendMessage(requestBody);
        subscriber.next(REQUESTING_VD);

        if (options.waitForResponse === false) {
            subscriber.complete();

            return;
        }

        const abortSub = merge(
            fromEvent(socket, 'error') as Observable<Event>,
            fromEvent(socket, 'close') as Observable<CloseEvent>,
            fromEvent(socket, 'closing') as Observable<CloseEvent>,
        ).subscribe(onAbort);

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

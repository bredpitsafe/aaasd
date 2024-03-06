import { Observable, ObservableNotification } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import {
    ChannelCloseReason,
    createEnvelope,
    EnvelopeTransmitter,
    openChannelFactory,
    supportChannelFactory,
} from 'webactor';

import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { GrpcError } from '../../../types/GrpcError';
import { TStructurallyCloneable, TStructurallyCloneableError } from '../../../types/serialization';
import { tapError } from '../../Rx/tap';
import { logger } from '../../Tracing';
import { TActorEnvelopeBox } from '../def';
import { createActorEnvelopeBox } from '../index';
import { dematerialize } from '../materialize/dematerialize';
import { materialize } from '../materialize/materialize';
import type { TActorObservableBox } from './def';

class WebactorError extends Error {
    static prefix = 'WebactorError';
    public static isStructurallyCloneableError(v: unknown): v is TStructurallyCloneableError {
        return v instanceof Error && v.message.startsWith(WebactorError.prefix);
    }

    public static fromStructurallyCloneableError(
        error: TStructurallyCloneableError,
    ): WebactorError {
        const webactorError = new WebactorError(
            error.message.slice(WebactorError.prefix.length + 1),
        );

        webactorError.stack = error.stack;

        return webactorError;
    }

    public toStructurallyCloneable(): TStructurallyCloneableError {
        const err = new Error(`${WebactorError.prefix}|${this.message}`);

        err.stack = this.stack;

        return err;
    }
}

export const createActorObservableBox =
    <Request extends TStructurallyCloneable, Response extends TStructurallyCloneable>() =>
    <Type extends string>(type: Type): TActorObservableBox<Type, Request, Response> => {
        const requestEnvBox = createActorEnvelopeBox<Request>()(type);
        const responseEnvBox = createActorEnvelopeBox<ObservableNotification<Response>>()(
            `RESPONSE_${type}`,
        );

        const responseStream = (
            transmitter: EnvelopeTransmitter,
            obs$: (p: Request) => Observable<Response>,
        ) => {
            return createActorObservable<Request, Response>(
                transmitter,
                obs$,
                requestEnvBox,
                responseEnvBox,
            );
        };

        const requestStream = (transmitter: EnvelopeTransmitter, body: Request) => {
            return requestActorObservable<Request, Response>(
                transmitter,
                body,
                requestEnvBox,
                responseEnvBox,
            );
        };

        return {
            responseStream,
            requestStream,
            requestType: requestEnvBox.type,
            responseType: responseEnvBox.type,
        };
    };

function createActorObservable<
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
>(
    transmitter: EnvelopeTransmitter,
    obs$: (p: Request) => Observable<Response>,
    requestBox: TActorEnvelopeBox<any, Request>,
    responseBox: TActorEnvelopeBox<any, ObservableNotification<Response>>,
) {
    const supportChannel = supportChannelFactory(transmitter);
    const openSub = requestBox.as$(transmitter).subscribe((envelope) => {
        const closeChannel = supportChannel(envelope, (channel) => {
            const payloadSub = obs$(envelope.payload)
                .pipe(
                    materialize(),
                    finalize(() => closeChannel()),
                )
                .subscribe((notification) => {
                    responseBox.send(channel, notification);
                });

            return (reason) => {
                payloadSub.unsubscribe();

                if (reason === ChannelCloseReason.LoseChannel) {
                    // why don't we use `box.notify.send` here?
                    // because thread which is responsible for handling this error is already dead
                    logger.error('[Webactor] Lose channel');
                }
            };
        });
    });

    return () => {
        openSub.unsubscribe();
    };
}

function requestActorObservable<
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
>(
    transmitter: EnvelopeTransmitter,
    body: Request,
    requestBox: TActorEnvelopeBox<any, Request>,
    responseBox: TActorEnvelopeBox<any, ObservableNotification<Response>>,
): Observable<Response> {
    const openChannel = openChannelFactory(transmitter);

    return new Observable<Response>((subscriber) => {
        const closeChannels = openChannel(createEnvelope(requestBox.type, body), (channel) => {
            const notifySub = responseBox
                .as$(channel)
                .pipe(
                    map((env) => env.payload),
                    dematerialize<Response>([WebactorError, GrpcError, SocketStreamError]),
                )
                .subscribe(subscriber);

            return (reason) => {
                notifySub.unsubscribe();

                if (reason === ChannelCloseReason.LoseChannel) {
                    subscriber.error(
                        new WebactorError(
                            '[Webactor] Lose channel, for further correct work you should restart your application',
                        ),
                    );
                }
            };
        });

        return () => {
            closeChannels();
        };
    }).pipe(tapError((err: Error) => logger.error('[Webactor] An error occurred', err)));
}

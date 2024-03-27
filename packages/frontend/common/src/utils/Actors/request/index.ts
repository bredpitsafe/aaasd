import { Observable, ObservableNotification } from 'rxjs';
import { Actor, ActorContext, createRequest, createResponseFactory } from 'webactor';

import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TStructurallyCloneable } from '../../../types/serialization';
import { TActorEnvelopeBox } from '../def';
import { createActorEnvelopeBox } from '../index';
import { dematerialize } from '../materialize/dematerialize';
import { materialize } from '../materialize/materialize';
import { TActorRequestBox } from './def';

export const createActorRequestBox =
    <Request extends TStructurallyCloneable, Response extends TStructurallyCloneable>() =>
    <Type extends string>(type: Type): TActorRequestBox<Type, Request, Response> => {
        const requestType = type;
        const responseType = `RESPONSE_${type}` as const;

        const requestEnvBox = createActorEnvelopeBox<Request>()(requestType);
        const responseEnvBox =
            createActorEnvelopeBox<ObservableNotification<Response>>()(responseType);
        const request = (actor: Actor | ActorContext, body: Request) => {
            return createActorRequest<Request, Response>(actor, body, requestEnvBox);
        };

        const response = (
            actor: Actor | ActorContext,
            obs$: (p: Request) => Observable<Response>,
        ) => {
            return createActorResponse<Request, Response>(
                actor,
                obs$,
                requestEnvBox,
                responseEnvBox,
            );
        };

        return { request, response, requestType, responseType };
    };

function createActorResponse<
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
>(
    actor: Actor | ActorContext,
    obs$: (p: Request) => Observable<Response>,
    requestBox: TActorEnvelopeBox<any, Request>,
    responseBox: TActorEnvelopeBox<any, ObservableNotification<Response>>,
): VoidFunction {
    const createResponse = createResponseFactory(actor.dispatch);
    const sub = requestBox.as$(actor).subscribe((envelope) => {
        const response = createResponse(envelope);

        obs$(envelope.payload)
            .pipe(materialize())
            .subscribe((notification) => {
                response(responseBox.create(notification));
            });
    });

    return () => sub.unsubscribe();
}

function createActorRequest<
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
>(
    actor: Actor | ActorContext,
    body: Request,
    requestBox: TActorEnvelopeBox<any, Request>,
): Observable<Response> {
    const request = createRequest(actor);
    const envelope = requestBox.create(body);

    return new Observable<ObservableNotification<Response>>((subscriber) => {
        const close = request(envelope, (response) => {
            subscriber.next(response.payload);
        });

        return () => close();
    }).pipe(dematerialize([SocketStreamError]));
}

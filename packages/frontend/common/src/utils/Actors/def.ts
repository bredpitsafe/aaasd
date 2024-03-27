import { Observable } from 'rxjs';
import {
    Envelope,
    EnvelopeDispatchTarget,
    EnvelopeSubscribeSource,
    UnknownEnvelope,
} from 'webactor';

export type TActorEnvelopeBox<Type extends string, Payload> = {
    type: Type;
    is: (e: UnknownEnvelope) => e is Envelope<Type, Payload>;
    as$: <Source extends EnvelopeSubscribeSource<Envelope<Type, Payload>>>(
        source: Source,
    ) => Observable<Envelope<Type, Payload>>;
    create: (payload: Payload, transferable?: Transferable[]) => Envelope<Type, Payload>;
    send: <Target extends EnvelopeDispatchTarget<Envelope<Type, Payload>>>(
        target: Target,
        payload: Payload,
        transferable?: Transferable[],
    ) => void;
};

export type ExtractActorEnvBoxType<B> = B extends TActorEnvelopeBox<infer T, any> ? T : never;
export type ExtractActorEnvBoxPayload<B> = B extends TActorEnvelopeBox<any, infer P> ? P : never;

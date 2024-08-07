import type { Observable } from 'rxjs';

type BaseEnvelope = {
    correlationId: number;
};

export type PayloadEnvelope<Payload> = BaseEnvelope & { payload: Payload };
export type FinalizeEnvelope = BaseEnvelope & { finalize: true };
export type ErrorEnvelope = BaseEnvelope & { error: any };

export type Envelope<Payload> = PayloadEnvelope<Payload> | FinalizeEnvelope | ErrorEnvelope;

export type TActorEnvelopeBox<Type extends string, Payload> = {
    type: Type;
    as$: (source: any) => Observable<{ payload: Payload }>;
    send: (target: any, payload: Payload) => void;
};

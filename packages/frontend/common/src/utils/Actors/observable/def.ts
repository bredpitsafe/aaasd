import { Observable } from 'rxjs';
import { EnvelopeTransmitter } from 'webactor';

import { TStructurallyCloneable } from '../../../types/serialization';

export type TActorObservableBox<
    Type extends string,
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
> = {
    requestStream: (transmitter: EnvelopeTransmitter, body: Request) => Observable<Response>;
    responseStream: (
        transmitter: EnvelopeTransmitter,
        obs$: (body: Request) => Observable<Response>,
    ) => VoidFunction;
    requestType: Type;
    responseType: `RESPONSE_${Type}`;
};

export type TActorObservableBoxParams<B extends TActorObservableBox<any, any, any>> =
    B extends TActorObservableBox<any, infer P, any> ? P : never;

export type TActorObservableBoxResult<B extends TActorObservableBox<any, any, any>> =
    B extends TActorObservableBox<any, any, infer R> ? R : never;

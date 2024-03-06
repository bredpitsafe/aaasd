import { Observable } from 'rxjs';
import { Actor, ActorContext } from 'webactor';

import { TStructurallyCloneable } from '../../../types/serialization';

export type TActorRequestBox<
    Type extends string,
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
> = {
    request: (actor: Actor | ActorContext, body: Request) => Observable<Response>;
    response: (
        actor: Actor | ActorContext,
        obs$: (body: Request) => Observable<Response>,
    ) => VoidFunction;
    requestType: `[${Type}]: Request`;
    responseType: `[${Type}]: Response`;
};

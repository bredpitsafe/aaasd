import type { TStructurallyCloneable } from '@common/types';
import type { Observable } from 'rxjs';

import type { IModuleActor } from '../../../modules/actor';

export type TActorObservableBox<
    Type extends string,
    Request extends TStructurallyCloneable,
    Response extends TStructurallyCloneable,
> = {
    // TODO: do we actually need `transmitter` here?
    requestStream: (transmitter: IModuleActor, body: Request) => Observable<Response>;
    responseStream: (
        transmitter: IModuleActor,
        obs$: (body: Request) => Observable<Response>,
    ) => VoidFunction;
    requestType: Type;
    responseType: `RESPONSE_${Type}`;
    destroy: VoidFunction;
};

import { createActor } from '../../utils/Actors';
import { transformAndRedirectActions } from './actions/transformAndRedirectActions';
import { EActorName } from './defs';

// Root actor is always shared worker
export function createActorRoot() {
    return createActor(EActorName.Root, (context) => {
        transformAndRedirectActions(context);
    });
}

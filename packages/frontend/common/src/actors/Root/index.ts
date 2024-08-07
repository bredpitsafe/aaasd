import { createActor } from '../../utils/Actors';
import { EActorName } from './defs';

// Root actor is always shared worker
export function createActorRoot() {
    return createActor(EActorName.Root, () => {});
}

import type { Actor } from '../actors/def.ts';
import { createLocalWorkerActor } from '../actors/LocalWorker';

export const startupApplication = (actorTab: Actor) => {
    const actorWorker = createLocalWorkerActor();

    actorWorker.launch();
    actorTab.launch();
    return actorWorker;
};

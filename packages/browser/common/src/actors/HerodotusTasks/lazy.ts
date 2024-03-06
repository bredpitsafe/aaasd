import {
    getActiveHerodotusTasksEnvBox,
    getArchivedHerodotusTasksEnvBox,
} from '../../envelops/herodotusTasks';
import { lazifyActor } from '../../utils/Actors';

export const createLazyActorHerodotusTasks = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getArchivedHerodotusTasksEnvBox.requestType:
                case getActiveHerodotusTasksEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorHerodotusTasks()),
    );

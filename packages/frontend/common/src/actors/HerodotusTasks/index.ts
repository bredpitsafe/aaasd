import { TContextRef } from '../../di';
import {
    getActiveHerodotusTasksEnvBox,
    getArchivedHerodotusTasksEnvBox,
} from '../../envelops/herodotusTasks';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { getActiveHerodotusTasks } from './actions/getActiveHerodotusTasks';
import { getArchivedHerodotusTasks } from './actions/getArchivedHerodotusTasks';

export function createActorHerodotusTasks() {
    return createActor(EActorName.HerodotusTasks, (context) => {
        const ctx = context as unknown as TContextRef;

        getArchivedHerodotusTasksEnvBox.responseStream(context, ({ url, params, options }) => {
            return getArchivedHerodotusTasks(ctx, url, params, options);
        });
        getActiveHerodotusTasksEnvBox.responseStream(context, ({ url, params, options }) => {
            return getActiveHerodotusTasks(ctx, url, params, options);
        });
    });
}

import type { TContextRef } from '../../di';
import {
    getActiveHerodotusTasksEnvBox,
    getArchivedHerodotusTasksEnvBox,
} from '../../envelops/herodotusTasks';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { ModuleGetActiveHerodotusTasks } from './actions/ModuleGetActiveHerodotusTasks';
import { ModuleGetArchivedHerodotusTasks } from './actions/ModuleGetArchivedHerodotusTasks';

export function createActorHerodotusTasks() {
    return createActor(EActorName.HerodotusTasks, (context) => {
        const ctx = context as unknown as TContextRef;
        const getActiveHerodotusTasks = ModuleGetActiveHerodotusTasks(ctx);
        const getArchivedHerodotusTasks = ModuleGetArchivedHerodotusTasks(ctx);

        getArchivedHerodotusTasksEnvBox.responseStream(context, ({ url, params, options }) => {
            return getArchivedHerodotusTasks({ target: url, ...params }, options);
        });
        getActiveHerodotusTasksEnvBox.responseStream(context, ({ url, params, options }) => {
            return getActiveHerodotusTasks({ target: url, ...params }, options);
        });
    });
}

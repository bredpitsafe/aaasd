import type { TGetActiveHerodotusTasksResult } from '../actors/HerodotusTasks/actions/ModuleGetActiveHerodotusTasks';
import type { TGetArchivedHerodotusTasksResult } from '../actors/HerodotusTasks/actions/ModuleGetArchivedHerodotusTasks';
import type { TWithTraceId } from '../modules/actions/def.ts';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketURL } from '../types/domain/sockets';
import { createActorObservableBox } from '../utils/Actors/observable';

export const getActiveHerodotusTasksEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        params: {
            robotId: TRobotId;
        };
        options: TWithTraceId;
    },
    TGetActiveHerodotusTasksResult
>()(`GET_ACTIVE_HERODOTUS_TASKS`);

export const getArchivedHerodotusTasksEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        params: {
            robotId: TRobotId;
        };
        options: TWithTraceId;
    },
    TGetArchivedHerodotusTasksResult
>()(`GET_ARCHIVED_HERODOTUS_TASKS`);

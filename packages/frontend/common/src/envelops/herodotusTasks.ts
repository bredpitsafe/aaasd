import { TGetActiveHerodotusTasksResult } from '../actors/HerodotusTasks/actions/getActiveHerodotusTasks';
import { TGetArchivedHerodotusTasksResult } from '../actors/HerodotusTasks/actions/getArchivedHerodotusTasks';
import { THandlerOptions } from '../modules/communicationHandlers/def';
import { TRobotId } from '../types/domain/robots';
import { TSocketURL } from '../types/domain/sockets';
import { createActorObservableBox } from '../utils/Actors/observable';

export const getActiveHerodotusTasksEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        options: THandlerOptions;
        params: {
            robotId: TRobotId;
        };
    },
    TGetActiveHerodotusTasksResult
>()(`GET_ACTIVE_HERODOTUS_TASKS`);

export const getArchivedHerodotusTasksEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        options: THandlerOptions;
        params: {
            robotId: TRobotId;
        };
    },
    TGetArchivedHerodotusTasksResult
>()(`GET_ARCHIVED_HERODOTUS_TASKS`);

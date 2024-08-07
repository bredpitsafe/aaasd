import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import type { THerodotusTaskId } from '@frontend/herodotus/src/types/domain';
import { filter, switchMap } from 'rxjs/operators';

import { ModuleGetListHerodotusTrades } from './ModuleGetListHerodotusTrades.ts';

export const ModuleGetListHerodotusTradesOnCurrentStage = createObservableProcedure((ctx) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const getListHerodotusTrades = ModuleGetListHerodotusTrades(ctx);

    return (params: { taskId: THerodotusTaskId; robotId: TRobotId }, options) => {
        return currentSocketUrl$.pipe(
            filter((target): target is TSocketURL => target !== undefined),
            switchMap((target) => getListHerodotusTrades({ target, ...params }, options)),
        );
    };
});

import { ModuleFactory } from '@frontend/common/src/di';
import { createObservableBox } from '@frontend/common/src/utils/rx';
import type { THerodotusTaskId } from '@frontend/herodotus/src/types/domain';

function createModule() {
    const boxTaskId = createObservableBox<undefined | THerodotusTaskId>(undefined);
    return {
        taskId$: boxTaskId.obs,
        setTaskId: boxTaskId.set,
    };
}

export const ModuleHerodotusTradesState = ModuleFactory(createModule);

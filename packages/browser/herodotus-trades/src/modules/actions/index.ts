import { ModuleFactory, TContextRef } from '@frontend/common/src/di';

import { getListHerodotusTrades } from './getListHerodotusTrades';

function createModule(ctx: TContextRef) {
    return {
        getListHerodotusTrades: getListHerodotusTrades.bind(null, ctx),
    };
}

export const ModuleHerodotusTradesActions = ModuleFactory(createModule);

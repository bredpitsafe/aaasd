import { ModuleFactory } from '../../di';
import type { IModuleRouter } from '../../types/router';
import { ETypicalRoute, TTypicalRouterData, TYPICAL_ROUTES } from './defs';
import { getRouterModule } from './module';

export const ModuleRouter = ModuleFactory(() => {
    return getRouterModule([], {}) as IModuleRouter<any>;
});

export const ModuleTypicalRouter = ModuleFactory((ctx) => {
    const module = ModuleRouter(ctx);

    module.router.add(TYPICAL_ROUTES);
    module.router.setOption('defaultRoute', ETypicalRoute.Default);

    return module as IModuleRouter<TTypicalRouterData>;
});

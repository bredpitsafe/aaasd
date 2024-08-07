import { ModuleFactory } from '../../di';
import type { IModuleRouter } from '../../types/router';
import type { TTypicalRouterData } from './defs';
import { ETypicalRoute, LAYOUT_ROUTES, TYPICAL_ROUTES } from './defs';
import { getRouterModule } from './module';

export const ModuleRouter = ModuleFactory((ctx) => {
    return getRouterModule(ctx, [], {}) as IModuleRouter<any>;
});

export const ModuleLayoutRouter = ModuleFactory((ctx) => {
    const module = ModuleRouter(ctx);

    module.router.add(LAYOUT_ROUTES);
    module.router.setOption('defaultRoute', ETypicalRoute.Default);

    return module as IModuleRouter<TTypicalRouterData>;
});

export const ModuleTypicalRouter = ModuleFactory((ctx) => {
    const module = ModuleLayoutRouter(ctx);

    module.router.add(TYPICAL_ROUTES);

    return module as IModuleRouter<TTypicalRouterData>;
});

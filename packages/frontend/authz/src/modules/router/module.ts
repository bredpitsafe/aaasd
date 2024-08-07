import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleLayoutRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import type { TAuthzRouterData } from './def';
import { EAuthzRoutes } from './def';
import { decodeParams, encodeParams } from './encoders';

const authzRoutes = [
    {
        name: EAuthzRoutes.Auth,
        path: `/view${TYPICAL_GET_PARAMS}`,
        encodeParams,
        decodeParams,
    },
] as Route[];

export const ModuleAuthzRouter = ModuleFactory((ctx) => {
    const module = ModuleLayoutRouter(ctx);

    module.router.add(authzRoutes);
    module.router.setOption('allowNotFound', true);

    return module as unknown as IModuleRouter<TAuthzRouterData>;
});

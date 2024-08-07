import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import type { THerodotusTerminalRouterData } from './def';
import { EHerodotusTerminalRouteParams, EHerodotusTerminalRoutes } from './def';
import { decodeParams } from './encoders';

const HerodotusTerminalRoutes = [
    {
        name: EHerodotusTerminalRoutes.Robot,
        path: `/:${EHerodotusTerminalRouteParams.Robot}${TYPICAL_GET_PARAMS}`,
        decodeParams,
    },
] as Route[];

export const ModuleHerodotusTerminalRouter = ModuleFactory((ctx) => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(HerodotusTerminalRoutes);
    module.router.setOption('allowNotFound', true);

    return module as unknown as IModuleRouter<THerodotusTerminalRouterData>;
});

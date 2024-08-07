import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import { buildRouteQuery } from '@frontend/common/src/modules/router/utils';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import type { TWSQueryTerminalRouterData } from './def';
import { EWSQueryTerminalRouteParams, EWSQueryTerminalRoutes } from './def';
import { decodeParams, encodeParams } from './encoders';

const WSQueryTerminalRoutes = [
    {
        name: EWSQueryTerminalRoutes.Terminal,
        path: `/terminal${buildRouteQuery(TYPICAL_GET_PARAMS, EWSQueryTerminalRouteParams)}`,
        encodeParams,
        decodeParams,
    },
] as Route[];

export const ModuleWSQueryTerminalRouter = ModuleFactory((ctx) => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(WSQueryTerminalRoutes);
    module.router.setOption('allowNotFound', true);

    return module as unknown as IModuleRouter<TWSQueryTerminalRouterData>;
});

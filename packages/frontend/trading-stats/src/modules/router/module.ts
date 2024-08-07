import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import { buildRouteQuery } from '@frontend/common/src/modules/router/utils';
import { omit } from 'lodash-es';
import type { Route } from 'router5';

import type { IModuleTradingStatsRouter } from './defs';
import { ETradingStatsRouteParams, ETradingStatsRoutes } from './defs';
import { decodeParams, encodeParams } from './encoders';

const TradingStatsRoutes = [
    {
        name: ETradingStatsRoutes.Daily,
        path: `/daily${buildRouteQuery(
            TYPICAL_GET_PARAMS,
            omit(ETradingStatsRouteParams, 'Socket'),
        )}`,
        decodeParams,
        encodeParams,
    },
    {
        name: ETradingStatsRoutes.Monthly,
        path: `/monthly${buildRouteQuery(
            TYPICAL_GET_PARAMS,
            omit(ETradingStatsRouteParams, 'Socket'),
        )}`,
        decodeParams,
        encodeParams,
    },
] as Route[];

export const ModuleTradingStatsRouter = ModuleFactory((ctx) => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(TradingStatsRoutes);
    module.router.setOption('allowNotFound', true);

    return module as unknown as IModuleTradingStatsRouter;
});

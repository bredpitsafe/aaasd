import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import { buildRouteQuery } from '@frontend/common/src/modules/router/utils';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import { ETradingServersManagerRouteParams, ETradingServersManagerRoutes } from './defs';
import { decodeParams, encodeParams } from './encoders';

const query = buildRouteQuery(
    TYPICAL_GET_PARAMS,
    ETradingServersManagerRouteParams.ConfigDigest,
    ETradingServersManagerRouteParams.ConfigSelection,
    ETradingServersManagerRouteParams.StateEditor,
    ETradingServersManagerRouteParams.InstrumentsList,
    ETradingServersManagerRouteParams.OverrideInstrumentsList,
    ETradingServersManagerRouteParams.RevisionInstrumentsList,
    ETradingServersManagerRouteParams.RevisionProviderInstrumentsList,
);

const TradingServersManagerRoutes = [
    {
        name: ETradingServersManagerRoutes.Server,
        path: `/:${ETradingServersManagerRouteParams.Server}${query}`,
        decodeParams,
        encodeParams,
    },
    {
        name: ETradingServersManagerRoutes.Gate,
        path: `/gate/:${ETradingServersManagerRouteParams.Gate}${query}`,
        decodeParams,
        encodeParams,
    },
    {
        name: ETradingServersManagerRoutes.Robot,
        path: `/robot/:${ETradingServersManagerRouteParams.Robot}${query}`,
        decodeParams,
        encodeParams,
    },
] as Route[];

export const ModuleTradingServersManagerRouter = ModuleFactory((ctx) => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(TradingServersManagerRoutes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return module as unknown as IModuleRouter<any>;
});

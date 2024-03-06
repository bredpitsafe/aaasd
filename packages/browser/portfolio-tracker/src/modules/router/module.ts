import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import type { Route } from 'router5';

import {
    EPortfolioTrackerRoute,
    EPortfolioTrackerSearchParams,
    IModulePortfolioTrackerRouter,
} from './def';
import { decodeParams, encodeParams } from './encoders';

const routes = [
    {
        name: EPortfolioTrackerRoute.Portfolio,
        path: `/:${ETypicalSearchParams.Socket}/?:${EPortfolioTrackerSearchParams.ActiveBooks}&:${ETypicalSearchParams.TableFilter}&:${ETypicalSearchParams.Tab}`,
        encodeParams,
        decodeParams,
    },
] as Route[];

export const ModulePortfolioTrackerRouter = ModuleFactory((ctx): IModulePortfolioTrackerRouter => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(routes);

    return module as unknown as IModulePortfolioTrackerRouter;
});

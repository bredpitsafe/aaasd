import { ModuleFactory, TContextRef } from '@frontend/common/src/di';

import { downloadCurrentPortfolioDebugInfo$ } from './downloadCurrentPortfolioDebugInfo$';
import { getPortfolioPositionsDedobsed$ } from './getPortfolioPositionsDedobsed$';
import { getPortfolioRisksDedobsed$ } from './getPortfolioRisksDedobsed$';
import { getPortfolioTradesDedobsed$ } from './getPortfolioTradesDedobsed$';
import { setActiveBookIds } from './setActiveBookIds';

function createModule(ctx: TContextRef) {
    return {
        downloadCurrentPortfolioDebugInfo$: downloadCurrentPortfolioDebugInfo$.bind(null, ctx),

        setActiveBookIds: setActiveBookIds.bind(null, ctx),
        getPortfolioPositionsDedobsed$: getPortfolioPositionsDedobsed$.bind(null, ctx),
        getPortfolioTradesDedobsed$: getPortfolioTradesDedobsed$.bind(null, ctx),
        getPortfolioRisksDedobsed$: getPortfolioRisksDedobsed$.bind(null, ctx),
    };
}

export const ModulePortfolioTrackerActions = ModuleFactory(createModule);

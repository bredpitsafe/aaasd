import { TContextRef } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { TPortfolioBookId } from '@frontend/common/src/types/domain/portfolioTraсker';

import { EPortfolioTrackerRoute, EPortfolioTrackerSearchParams } from '../router/def';
import { ModulePortfolioTrackerRouter } from '../router/module';

export function setActiveBookIds(ctx: TContextRef, bookIds: undefined | TPortfolioBookId[]) {
    const { navigate, getState } = ModulePortfolioTrackerRouter(ctx);
    const socket = extractRouterParam(getState().route, EPortfolioTrackerSearchParams.Socket);

    if (socket === undefined) {
        throw new Error('Socket not defined');
    }

    return navigate(EPortfolioTrackerRoute.Portfolio, {
        socket,
        activeBooks: bookIds,
    });
}

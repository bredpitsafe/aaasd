import type {
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute, ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import type { Assign, ValueOf } from '@frontend/common/src/types';
import type { TPortfolioBookId } from '@frontend/common/src/types/domain/portfolioTraсker';
import type { IModuleRouter } from '@frontend/common/src/types/router';

export const EPortfolioTrackerRoute = <const>{
    ...ETypicalRoute,
    Portfolio: 'portfolio',
};

export const EPortfolioTrackerSearchParams = <const>{
    ...ETypicalSearchParams,
    ActiveBooks: 'activeBooks',
};

export type TActiveBooks = TPortfolioBookId[];

type TPortfolioTrackerPortfolioRouteParams = Assign<
    TTypicalStageRouteParams,
    {
        [EPortfolioTrackerSearchParams.ActiveBooks]: undefined | TActiveBooks;
    }
>;

type TPortfolioTrackerRouterData = TTypicalRouterData & {
    [EPortfolioTrackerRoute.Portfolio]: TPortfolioTrackerPortfolioRouteParams;
};

export type TAllPortfolioTrackerRouteParams = ValueOf<TPortfolioTrackerRouterData>;

export type TEncodedPortfolioTrackerRouteParams = TEncodedTypicalRouteParams & {
    [EPortfolioTrackerSearchParams.ActiveBooks]?: string;
};

export type IModulePortfolioTrackerRouter = IModuleRouter<TPortfolioTrackerRouterData>;

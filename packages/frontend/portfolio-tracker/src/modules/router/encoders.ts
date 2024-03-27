import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import { compact } from 'lodash-es';

import {
    EPortfolioTrackerSearchParams,
    TActiveBooks,
    TAllPortfolioTrackerRouteParams,
    TEncodedPortfolioTrackerRouteParams,
} from './def';

export const encodeParams = (
    params: TAllPortfolioTrackerRouteParams,
): TEncodedPortfolioTrackerRouteParams => {
    const encoded = encodeTypicalParams(params) as TEncodedPortfolioTrackerRouteParams;
    const activeBooks =
        EPortfolioTrackerSearchParams.ActiveBooks in params
            ? params[EPortfolioTrackerSearchParams.ActiveBooks]
            : undefined;

    if (activeBooks !== undefined && activeBooks.length > 0) {
        encoded[EPortfolioTrackerSearchParams.ActiveBooks] = activeBooks.join(',');
    }

    return encoded;
};

export const decodeParams = (
    params: TEncodedPortfolioTrackerRouteParams,
): TAllPortfolioTrackerRouteParams => {
    return {
        ...params,
        ...decodeTypicalParams(params),
        [EPortfolioTrackerSearchParams.ActiveBooks]: extractValidActivePortfolio(
            params[EPortfolioTrackerSearchParams.ActiveBooks],
        ),
    };
};

function extractValidActivePortfolio(books: undefined | string): undefined | TActiveBooks {
    return books === undefined
        ? undefined
        : (compact(decodeURIComponent(books).split(',').map(Number)) as TActiveBooks);
}

import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TPortfolio, TPortfolioBook } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';

type TSendBody = {
    type: 'FetchPortfolioBooks';
};

type TReceiveBody = {
    portfolios: TPortfolio[];
    books: TPortfolioBook[];
};

export function fetchPortfoliosWithBooksHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchPortfoliosWithBooksHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchPortfolioBooks',
        },
        options,
    );
}

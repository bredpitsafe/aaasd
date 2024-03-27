import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioTrade } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';

type TFetchPortfolioTradesFilter = {
    booksIds: Array<TPortfolioBookId>;
};

type TSendBody = {
    type: 'FetchPortfolioTrades';
    filters: TFetchPortfolioTradesFilter;
};

type TReceiveBody = {
    trades: Array<TPortfolioTrade>;
};

export function fetchPortfolioTradesHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchPortfolioTradesHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchPortfolioTrades',
            filters: { booksIds },
        },
        options,
    );
}

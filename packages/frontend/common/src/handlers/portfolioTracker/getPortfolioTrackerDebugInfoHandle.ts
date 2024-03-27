import { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import {
    TPortfolioBookId,
    TPortfolioDebugRiskCalculation,
} from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';

type TSendBody = {
    type: 'FetchPortfolioDebugRiskCalculation';
    filters: { booksIds: TPortfolioBookId[] };
};

type TReceivedBody = TPortfolioDebugRiskCalculation;

export function getPortfolioTrackerDebugInfoHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    booksIds: TPortfolioBookId[],
    options: THandlerOptions,
): Observable<TReceivedData<TReceivedBody>> {
    logger.trace('[getPortfolioTrackerDebugInfoHandle]: init observable', { url, ...options });

    return handler<TSendBody, TReceivedBody>(
        url,
        {
            type: 'FetchPortfolioDebugRiskCalculation',
            filters: { booksIds },
        },
        options,
    );
}

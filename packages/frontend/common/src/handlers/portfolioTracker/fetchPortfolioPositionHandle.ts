import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioPosition } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { modifyPositions } from './utils';

type TFetchPortfolioPositionsFilter = {
    booksIds: Array<TPortfolioBookId>;
};

type TSendBody = {
    type: 'FetchPortfolioPositions';
    filters: TFetchPortfolioPositionsFilter;
};

type TReceiveBody = {
    positions: Array<TPortfolioPosition>;
};

export function fetchPortfolioPositionHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchPortfolioPositionHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchPortfolioPositions',
            filters: { booksIds },
        },
        options,
    ).pipe(
        map((envelope) => {
            modifyPositions(envelope.payload.positions);
            return envelope;
        }),
    );
}

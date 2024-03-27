import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioRisks } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { modifyRisks } from './utils';

type TFetchPortfolioRisksFilter = {
    booksIds: Array<TPortfolioBookId>;
};

type TSendBody = {
    type: 'FetchPortfolioRisks';
    filters: TFetchPortfolioRisksFilter;
};

type TReceiveBody = {
    risks: Array<TPortfolioRisks>;
};

export function fetchPortfolioRisksHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchPortfolioRisksHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchPortfolioRisks',
            filters: { booksIds },
        },
        options,
    ).pipe(
        map((envelope) => {
            modifyRisks(envelope.payload.risks);
            return envelope;
        }),
    );
}

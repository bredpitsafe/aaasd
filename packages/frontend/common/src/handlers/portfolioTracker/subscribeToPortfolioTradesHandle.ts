import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { THandlerOptions, TStreamHandler } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioTrade } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { TSubscribed, TUnsubscribe } from '../def';
import { convertSubscribedToEmptyUpdate } from '../utils';

type TSendBody =
    | {
          type: 'SubscribeToPortfolioTrades';
          booksIds: Array<TPortfolioBookId>;
      }
    | TUnsubscribe;

type TUpdateBody = {
    updates: Array<TPortfolioTrade>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

export function subscribeToPortfolioTradesHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TUpdateBody>> {
    logger.trace('[subscribeToPortfolioTradesHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToPortfolioTrades',
                booksIds,
            },
            {
                type: 'Unsubscribe',
            },
        ],
        options,
    ).pipe(
        convertSubscribedToEmptyUpdate<TUpdateBody>(() => {
            return {
                updates: [],
            };
        }),
    );
}

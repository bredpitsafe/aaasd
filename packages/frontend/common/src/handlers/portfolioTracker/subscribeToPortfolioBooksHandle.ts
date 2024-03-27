import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TStreamHandler } from '../../modules/communicationHandlers/def';
import { TPortfolioBook } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { THandlerStreamOptions, TSubscribed, TUnsubscribe } from '../def';
import { convertSubscribedToEmptyUpdate } from '../utils';

type TSendBody =
    | {
          type: 'SubscribeToPortfolioBooks';
      }
    | TUnsubscribe;

type TUpdateBody = {
    updates: TPortfolioBook[];
};

type TReceiveBody = TSubscribed | TUpdateBody;

export function subscribeToPortfolioBooksHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    options: THandlerStreamOptions,
): Observable<TReceivedData<TUpdateBody>> {
    logger.trace('[subscribeToPortfolioBooksHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToPortfolioBooks',
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

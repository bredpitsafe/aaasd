import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { THandlerOptions, TStreamHandler } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioPosition } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { TSubscribed, TUnsubscribe } from '../def';
import { convertSubscribedToEmptyUpdate } from '../utils';
import { modifyPositions } from './utils';

type TSendBody =
    | {
          type: 'SubscribeToPortfolioPositions';
          booksIds: Array<TPortfolioBookId>;
      }
    | TUnsubscribe;

type TUpdateBody = {
    updates: Array<TPortfolioPosition>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

export function subscribeToPortfolioPositionsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TUpdateBody>> {
    logger.trace('[subscribeToPortfolioPositionHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToPortfolioPositions',
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
        map((envelope) => {
            modifyPositions(envelope.payload.updates);
            return envelope;
        }),
    );
}

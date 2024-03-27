import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { THandlerOptions, TStreamHandler } from '../../modules/communicationHandlers/def';
import { TPortfolioBookId, TPortfolioRisks } from '../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { TSubscribed, TUnsubscribe } from '../def';
import { convertSubscribedToEmptyUpdate } from '../utils';
import { modifyRisks } from './utils';

type TSendBody =
    | {
          type: 'SubscribeToPortfolioRisks';
          booksIds: Array<TPortfolioBookId>;
      }
    | TUnsubscribe;

type TUpdateBody = {
    updates: Array<TPortfolioRisks>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

export function subscribeToPortfolioRisksHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    booksIds: Array<TPortfolioBookId>,
    options: THandlerOptions,
): Observable<TReceivedData<TUpdateBody>> {
    logger.trace('[subscribeToPortfolioRisksHandle]', {
        url,
        booksIds,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToPortfolioRisks',
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
            modifyRisks(envelope.payload.updates);
            return envelope;
        }),
    );
}

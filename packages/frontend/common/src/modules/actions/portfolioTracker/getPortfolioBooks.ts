import { Observable } from 'rxjs';

import { getPortfoliosWithBooksEnvBox } from '../../../actors/PortfolioTrackerDataProvider/envelops';
import { TPortfolio, TPortfolioBook } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { tapError } from '../../../utils/Rx/tap';
import { TraceId } from '../../../utils/traceId';
import { IModuleActor } from '../../actor';
import { IModuleNotifications } from '../../notifications/def';

export function getPortfoliosWithBooksUnbound(
    { actor, notifications }: { actor: IModuleActor; notifications: IModuleNotifications },
    url: TSocketURL,
    traceId: TraceId,
): Observable<{ books: TPortfolioBook[]; portfolios: TPortfolio[] }> {
    return getPortfoliosWithBooksEnvBox.requestStream(actor, { url, traceId }).pipe(
        tapError((error) => {
            notifications.error({
                traceId,
                message: 'Failed to receive a portfolio books',
                description: error.message,
            });
        }),
        progressiveRetry(),
    );
}

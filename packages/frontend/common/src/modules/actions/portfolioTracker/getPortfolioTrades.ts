import { Observable } from 'rxjs';

import { getPortfolioTradesEnvBox } from '../../../actors/PortfolioTrackerDataProvider/envelops';
import { TPortfolioBookId, TPortfolioTrade } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { tapError } from '../../../utils/Rx/tap';
import { TraceId } from '../../../utils/traceId';
import { IModuleActor } from '../../actor';
import { IModuleNotifications } from '../../notifications/def';

export function getPortfolioTradesUnbound(
    { actor, notifications }: { actor: IModuleActor; notifications: IModuleNotifications },
    url: TSocketURL,
    bookIds: TPortfolioBookId[],
    traceId: TraceId,
): Observable<TPortfolioTrade[]> {
    return getPortfolioTradesEnvBox
        .requestStream(actor, {
            url,
            bookIds,
            traceId,
        })
        .pipe(
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive a portfolio trades',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
}

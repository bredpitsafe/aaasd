import { Observable } from 'rxjs';

import { getPortfolioPositionsEnvBox } from '../../../actors/PortfolioTrackerDataProvider/envelops';
import { TPortfolioBookId, TPortfolioPosition } from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { tapError } from '../../../utils/Rx/tap';
import { TraceId } from '../../../utils/traceId';
import { IModuleActor } from '../../actor';
import { IModuleNotifications } from '../../notifications/def';

export function getPortfolioPositionsUnbound(
    { actor, notifications }: { actor: IModuleActor; notifications: IModuleNotifications },
    url: TSocketURL,
    bookIds: TPortfolioBookId[],
    traceId: TraceId,
): Observable<TPortfolioPosition[]> {
    return getPortfolioPositionsEnvBox
        .requestStream(actor, {
            url,
            bookIds,
            traceId,
        })
        .pipe(
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive a portfolio positions',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
}

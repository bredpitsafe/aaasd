import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getPortfolioTrackerDebugInfoHandle } from '../../../handlers/portfolioTracker/getPortfolioTrackerDebugInfoHandle';
import {
    TPortfolioBookId,
    TPortfolioDebugRiskCalculation,
} from '../../../types/domain/portfolioTraсker';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { TFetchHandler, THandlerOptions } from '../../communicationHandlers/def';
import { IModuleNotifications } from '../../notifications/def';

export function getPortfolioDebugInfo(
    {
        fetch,
        errorNotify,
    }: {
        fetch: TFetchHandler;
        errorNotify: IModuleNotifications['error'];
    },
    url: TSocketURL,
    bookIds: TPortfolioBookId[],
    options: THandlerOptions,
): Observable<TPortfolioDebugRiskCalculation> {
    return getPortfolioTrackerDebugInfoHandle(fetch, url, bookIds, options).pipe(
        map((envelope) => envelope.payload),
        tapError((error) => {
            errorNotify({
                message: 'Failed to receive a portfolio debug info',
                description: error.message,
                traceId: options.traceId,
            });
        }),
    );
}

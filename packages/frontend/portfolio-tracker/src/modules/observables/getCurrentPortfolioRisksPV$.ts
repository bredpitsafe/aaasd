import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TPortfolioRisks } from '@frontend/common/src/types/domain/portfolioTraсker';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { isNil, sumBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function getCurrentPortfolioRisksPV$(
    currentRisks$: Observable<undefined | TPortfolioRisks[]>,
) {
    return currentRisks$.pipe(
        map((risks) => {
            const pv = sumBy(risks, (risk) => risk.cashBalance + risk.deltaFxAtm);
            const portfolioPV = sumBy(risks, (risk) => risk.cashBalance + risk.deltaFxSkew);
            return {
                pv,
                portfolioPV,
                theta: sumBy(risks, (risks) => risks.theta),
                thetaFx: sumBy(risks, (risks) => risks.thetaFx),
                skewReserves: isNil(pv) || isNil(portfolioPV) ? undefined : pv - portfolioPV,
            };
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}

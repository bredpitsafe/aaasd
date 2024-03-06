import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { map } from 'rxjs/operators';

import { getActiveBookIds$ } from './getActiveBookIds$';
import { getCurrentAssetRecord$ } from './getCurrentAssetRecord$';
import { getCurrentBooksRecord$ } from './getCurrentBooksRecord$';
import { getCurrentInstrumentRecord$ } from './getCurrentInstrumentRecord$';
import { getCurrentPortfolioPositions$ } from './getCurrentPortfolioPositions$';
import { getCurrentPortfolioRisks$ } from './getCurrentPortfolioRisks$';
import { getCurrentPortfolioRisksPV$ } from './getCurrentPortfolioRisksPV$';
import { getCurrentPortfolioTrades$ } from './getCurrentPortfolioTrades$';
import { getPortfolioBooks$ } from './getPortfolioBooks$';

function createModule(ctx: TContextRef) {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    const activeBookIds$ = getActiveBookIds$(ctx);
    const portfoliosWithBooks$ = getPortfolioBooks$(ctx, currentSocketUrl$);
    const portfolios$ = portfoliosWithBooks$.pipe(map((v) => v?.portfolios));
    const books$ = portfoliosWithBooks$.pipe(map((v) => v?.books));
    const risk$ = getCurrentPortfolioRisks$(ctx, activeBookIds$, currentSocketUrl$);

    return {
        activeBookIds$,
        portfolios$,
        books$,
        currentBooksRecord$: getCurrentBooksRecord$(books$),
        currentAssetRecord$: getCurrentAssetRecord$(ctx, currentSocketUrl$),
        currentInstrumentRecord$: getCurrentInstrumentRecord$(ctx, currentSocketUrl$),
        currentPortfolioTrades$: getCurrentPortfolioTrades$(ctx, activeBookIds$, currentSocketUrl$),
        currentPortfolioPositions$: getCurrentPortfolioPositions$(
            ctx,
            activeBookIds$,
            currentSocketUrl$,
        ),
        currentPortfolioRisks$: risk$,
        currentPortfolioRisksPV$: getCurrentPortfolioRisksPV$(risk$),
    };
}

export const ModulePortfolioTrackerObservables = ModuleFactory(createModule);

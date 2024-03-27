import { TContextRef } from '@frontend/common/src/di';
import { ModuleCommonObservables } from '@frontend/common/src/modules/observables';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { combineLatest, filter, takeUntil } from 'rxjs';

import { ModulePortfolioTrackerActions } from '../modules/actions/module';
import { ModulePortfolioTrackerObservables } from '../modules/observables/module';

export function initAppEffects(ctx: TContextRef): void {
    syncServerNameToPageTitle(ctx);
    syncUrlToSocketPage(ctx);
    setupDefaultActiveBookIds(ctx);
}

function syncServerNameToPageTitle(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleSocketPage(ctx);

    currentSocketName$.subscribe((server) => {
        document.title = server ? `PT: ${server}` : 'Portfolio Tracker';
    });
}

function syncUrlToSocketPage(ctx: TContextRef): void {
    const { setCurrentSocket } = ModuleSocketPage(ctx);
    const { getRouterSocket$ } = ModuleCommonObservables(ctx);

    getRouterSocket$.subscribe(({ name, url }) => {
        setCurrentSocket(name, url);
    });
}

function setupDefaultActiveBookIds(ctx: TContextRef) {
    const { activeBookIds$, books$ } = ModulePortfolioTrackerObservables(ctx);
    const { setActiveBookIds } = ModulePortfolioTrackerActions(ctx);

    combineLatest([activeBookIds$, books$])
        .pipe(takeUntil(activeBookIds$.pipe(filter((ids) => ids !== undefined && ids.length > 0))))
        .subscribe(([activeBookIds, books]) => {
            if (
                (activeBookIds === undefined || activeBookIds.length > 0) &&
                books !== undefined &&
                books.length > 0
            ) {
                void setActiveBookIds([books[0].bookId]);
            }
        });
}

import type { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';

import type { TTradingStatsDailyRouteParams, TTradingStatsRoute } from '../modules/router/defs';
import { ETradingStatsRoutes } from '../modules/router/defs';
import { ModuleTradingStatsRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, ETradingStatsRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const { state$, navigate, router } = ModuleTradingStatsRouter(ctx);

    router.start();

    state$.subscribe((state) => {
        if (state === undefined) {
            return;
        }

        switch (state.route.name as TTradingStatsRoute) {
            case ETradingStatsRoutes.Stage: {
                // Redirect to daily stats
                return navigate(
                    ETradingStatsRoutes.Daily,
                    state.route.params as TTradingStatsDailyRouteParams,
                    {
                        replace: true,
                    },
                );
            }
        }
    });
}

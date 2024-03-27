import { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { combineLatest } from 'rxjs';

import {
    ETradingStatsRoutes,
    TTradingStatsDailyRouteParams,
    TTradingStatsRoute,
} from '../modules/router/defs';
import { ModuleTradingStatsRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, ETradingStatsRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const { state$, navigate, router } = ModuleTradingStatsRouter(ctx);
    const { serversList$ } = ModuleServers(ctx);

    router.start();

    combineLatest([state$, serversList$]).subscribe(async ([state]) => {
        if (state === undefined) {
            return;
        }

        switch (state.route.name as TTradingStatsRoute) {
            case ETradingStatsRoutes.Stage: {
                // Redirect to daily stats
                await navigate(
                    ETradingStatsRoutes.Daily,
                    state.route.params as TTradingStatsDailyRouteParams,
                    {
                        replace: true,
                    },
                );
                return;
            }
        }
    });
}

import { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ETypicalRoute } from '@frontend/common/src/modules/router/defs';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { isEmpty } from 'lodash-es';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';

import { ModuleRequest } from '../modules/request';
import {
    EWSQueryTerminalRoutes,
    TWSQueryTerminalRoute,
    TWSQueryTerminalRouteParams,
} from '../modules/router/def';
import { ModuleWSQueryTerminalRouter } from '../modules/router/module';

const SYNC_QUERY_DEBOUNCE_TIME = 500;
export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, ETypicalRoute.Default);
    syncQueryWithURL(ctx);
}

function initViewRouter(ctx: TContextRef): void {
    const { router, state$, navigate } = ModuleWSQueryTerminalRouter(ctx);
    const { serversList$ } = ModuleServers(ctx);

    router.start();

    combineLatest([state$, serversList$]).subscribe(async ([state]) => {
        if (state === undefined) {
            return;
        }

        switch (state.route.name as TWSQueryTerminalRoute) {
            case EWSQueryTerminalRoutes.Stage: {
                await navigate(
                    EWSQueryTerminalRoutes.Terminal,
                    state.route.params as TWSQueryTerminalRouteParams,
                    {
                        replace: true,
                    },
                );
                return;
            }
        }
    });
}

function syncQueryWithURL(ctx: TContextRef) {
    const { state$, setParams } = ModuleWSQueryTerminalRouter(ctx);
    const { query$, setQuery } = ModuleRequest(ctx);

    // Sync query from module to URL
    query$
        .pipe(debounceTime(SYNC_QUERY_DEBOUNCE_TIME), distinctUntilChanged())
        .subscribe((query) => {
            void setParams({ query: isEmpty(query) ? undefined : query });
        });

    // Sync query from URL to module
    state$
        .pipe(
            filter((state) => state.route.name === EWSQueryTerminalRoutes.Terminal),
            map((state) => (state.route.params as TWSQueryTerminalRouteParams)?.query),
            distinctUntilChanged(),
        )
        .subscribe((query) => {
            setQuery(query ?? '');
        });
}

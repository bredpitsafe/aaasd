import { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { isNil } from 'lodash-es';

import { EHerodotusTerminalRoutes } from '../modules/router/def';
import { ModuleHerodotusTerminalRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, EHerodotusTerminalRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const { getHerodotusRobots$ } = ModuleRobots(ctx);
    const { getState, navigate, router } = ModuleHerodotusTerminalRouter(ctx);

    router.start();

    getHerodotusRobots$().subscribe((robots) => {
        const state = getState();
        if (isNil(state)) {
            return;
        }

        switch (state.route.name) {
            case EHerodotusTerminalRoutes.Stage: {
                // Only redirect when there's exactly one robot on the selected server
                if (robots.length === 1) {
                    void navigate(
                        EHerodotusTerminalRoutes.Robot,
                        {
                            ...state.route.params,
                            robot: robots[0].id,
                        },
                        { replace: true },
                    );
                }
            }
        }
    });
}

import { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ModuleComponentStateEditor } from '@frontend/common/src/modules/componentStateEditor';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import type { TServer, TServerId } from '@frontend/common/src/types/domain/servers';
import { matchValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor';
import { isEmpty, noop } from 'lodash-es';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ETradingServersManagerRoutes, TTradingServersManagerRoute } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, ETradingServersManagerRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const { state$, navigate, setParams, router } = ModuleTradingServersManagerRouter(ctx);
    const { getComponentStateEditorState, setComponentStateEditorState } =
        ModuleComponentStateEditor(ctx);
    const { serversList$ } = ModuleServers(ctx);

    router.start();

    combineLatest([state$.pipe(filter((state) => !isEmpty(state))), serversList$]).subscribe(
        ([state, serversList]) => {
            switch (state.route.name as TTradingServersManagerRoute) {
                case ETradingServersManagerRoutes.Stage:
                case ETradingServersManagerRoutes.Server:
                case ETradingServersManagerRoutes.Gate:
                case ETradingServersManagerRoutes.Robot: {
                    matchValueDescriptor(serversList, {
                        idle: noop,
                        unsynchronized: noop,
                        fail: noop,
                        synchronized: (serversList) => {
                            const server = getValidServerId(state.route.params.server, serversList);

                            if (server !== undefined && server !== state.route.params.server) {
                                void navigate(
                                    ETradingServersManagerRoutes.Server,
                                    {
                                        ...state.route.params,
                                        // Redirect to the first server from the list
                                        server,
                                    },
                                    { replace: true },
                                );
                            }

                            return;
                        },
                    });
                }
            }
        },
    );

    /**
     * Employing router.subscribe for synchronous response to route changes. This approach is essential
     * as using `state$` is not suitable here. state$ operates on the next tick, which could reflect previous state
     * and lead to issues like infinite loops
     */
    router.subscribe((s) => {
        if (s.route.params.stateEditor !== s.previousRoute?.params.stateEditor) {
            setComponentStateEditorState(s.route.params.stateEditor);
        }
    });

    getComponentStateEditorState().subscribe((state) => {
        setParams({ stateEditor: state }, { replace: true });
    });
}

function getValidServerId(
    serverFromRoute: TServerId | undefined,
    serversList: TServer[] | undefined,
): TServerId | undefined {
    if (serverFromRoute && serversList?.some(({ id }) => id === serverFromRoute)) {
        return serverFromRoute;
    }

    return serversList?.[0]?.id;
}

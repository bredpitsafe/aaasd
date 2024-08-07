import { generateTraceId } from '@common/utils';
import type { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ModuleSubscribeToComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToComponentsSnapshot.ts';
import { ModuleComponentStateEditor } from '@frontend/common/src/modules/componentStateEditor';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TServer, TServerId } from '@frontend/common/src/types/domain/servers';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isEmpty, isNil } from 'lodash-es';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import type { TTradingServersManagerRoute } from '../modules/router/defs';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { ModuleTradingServersManagerRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, ETradingServersManagerRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const { state$, navigate, setParams, router } = ModuleTradingServersManagerRouter(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { getComponentStateEditorState, setComponentStateEditorState } =
        ModuleComponentStateEditor(ctx);
    const subscribeToComponentsSnapshot = ModuleSubscribeToComponentsSnapshot(ctx);

    const routerState$ = state$.pipe(filter((state) => !isEmpty(state)));
    const serversList$ = currentSocketUrl$.pipe(
        filter((target): target is TSocketURL => !isNil(target)),
        switchMap((target) => {
            return subscribeToComponentsSnapshot({ target }, { traceId: generateTraceId() });
        }),
        extractSyncedValueFromValueDescriptor(),
        map(({ servers }) => servers),
    );

    router.start();

    combineLatest([routerState$, serversList$]).subscribe(([state, serversList]) => {
        switch (state.route.name as TTradingServersManagerRoute) {
            case ETradingServersManagerRoutes.Stage:
            case ETradingServersManagerRoutes.Server:
            case ETradingServersManagerRoutes.Gate:
            case ETradingServersManagerRoutes.Robot: {
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
            }
        }
    });

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

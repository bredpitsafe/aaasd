import type { SubscribeState } from 'router5/dist/types/router';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import type { TContextRef } from '../di';
import { ModuleCommunication } from '../modules/communication';
import { ModuleRouter, ModuleTypicalRouter } from '../modules/router';
import { ETypicalSearchParams } from '../modules/router/defs';
import { extractRouterParam } from '../modules/router/utils';
import { ModuleSocketList } from '../modules/socketList';
import { ModuleSocketPage } from '../modules/socketPage';
import type { TSocketMap, TSocketName, TSocketURL } from '../types/domain/sockets';

/**
 * @deprecated
 */
export function syncSocketWithURL(ctx: TContextRef, defaultRoute: string): void {
    const { state$, navigate } = ModuleRouter(ctx);
    const { setCurrentSocketName, sockets$ } = ModuleCommunication(ctx);

    combineLatest([state$, sockets$])
        .pipe(
            filter(
                (args): args is [SubscribeState, TSocketMap] =>
                    args[0] !== undefined && args[1] !== undefined,
            ),
        )
        .subscribe(([state, sockets]) => {
            const { socket } = state.route.params;

            // Check whether socket name in URL is valid. If not, redirect to socket selection page.
            if (sockets[socket] !== undefined) {
                setCurrentSocketName(socket);
            } else {
                void navigate(defaultRoute, {}, { replace: true });
            }
        });
}

export function syncRouterWithSocket(ctx: TContextRef): void {
    const { state$ } = ModuleTypicalRouter(ctx);
    const { sockets$ } = ModuleSocketList(ctx);
    const { setCurrentSocket } = ModuleSocketPage(ctx);

    combineLatest([state$, sockets$])
        .pipe(
            map(([state, map]) => {
                const socket = extractRouterParam(state.route, ETypicalSearchParams.Socket);

                return [socket, socket && map?.[socket]];
            }),
            filter((args): args is [TSocketName, TSocketURL] => {
                return args[0] !== undefined && args[1] !== undefined;
            }),
        )
        .subscribe(([name, url]) => {
            setCurrentSocket(name, url);
        });
}

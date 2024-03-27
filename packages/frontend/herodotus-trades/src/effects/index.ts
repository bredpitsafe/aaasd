import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { combineLatest, EMPTY, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { ModuleHerodotusTradesActions } from '../modules/actions';
import { getTradesRouteParams, ModuleHerodotusTradesRouter } from '../modules/router';
import { ModuleHerodotusTradesState } from '../modules/state';
import { ModuleHerodotusTrades } from '../modules/trades';
import type { TTradesRouteParams } from '../types/router';
import { ETradesRoutes } from '../types/router';

export async function initEffects(ctx: TContextRef): Promise<void> {
    initContextUI(ctx);

    const { state$, router } = ModuleHerodotusTradesRouter(ctx);

    router.start();

    const routerState$ = state$.pipe(
        filter((state) => state?.route?.name === ETradesRoutes.Trades),
        map((state) => getTradesRouteParams(state.route.params)),
    );

    void initSocketListEffects(ctx);
    void initAuthentication(ctx);

    setupSocket(ctx, routerState$);
    loadTrades(ctx, routerState$);
    initActorDataSourceStatusEffects(ctx);
    initWorkerEffects(ctx);
}

function setupSocket(ctx: TContextRef, routeParams$: Observable<TTradesRouteParams>): void {
    const { getSocket$ } = ModuleSocketList(ctx);
    const { setCurrentSocket } = ModuleSocketPage(ctx);

    routeParams$
        .pipe(
            switchMap(({ socket }) => {
                return combineLatest({
                    name: of(socket),
                    url: getSocket$(socket),
                });
            }),
        )
        .subscribe(({ name, url }) => {
            setCurrentSocket(name as TSocketName, url);
        });
}

function loadTrades(ctx: TContextRef, routeParams$: Observable<TTradesRouteParams>): void {
    const { getListHerodotusTrades } = ModuleHerodotusTradesActions(ctx);
    const { setTrades } = ModuleHerodotusTrades(ctx);
    const { setTaskId } = ModuleHerodotusTradesState(ctx);

    routeParams$
        .pipe(
            switchMap(({ taskId, robotId, name }) => {
                return taskId && robotId
                    ? forkJoin([of(taskId), of(name), getListHerodotusTrades(taskId, robotId)])
                    : EMPTY;
            }),
        )
        .subscribe(([taskId, name, data]) => {
            setTrades(taskId, data.trades);
            setTaskId(taskId);
            document.title = name;
        });
}

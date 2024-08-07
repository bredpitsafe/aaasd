import { EApplicationName } from '@common/types';
import { generateTraceId } from '@common/utils';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, EMPTY, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { ModuleGetListHerodotusTradesOnCurrentStage } from '../modules/actions/ModuleGetListHerodotusTradesOnCurrentStage.ts';
import { getTradesRouteParams, ModuleHerodotusTradesRouter } from '../modules/router';
import { ModuleHerodotusTradesState } from '../modules/state';
import { ModuleHerodotusTrades } from '../modules/trades';
import type { TTradesRouteParams } from '../types/router';
import { ETradesRoutes } from '../types/router';

export async function initEffects(ctx: TContextRef): Promise<void> {
    initApplicationName(ctx, EApplicationName.HerodotusTrades);

    const { state$, router } = ModuleHerodotusTradesRouter(ctx);

    router.start();

    const routerState$ = state$.pipe(
        filter((state) => state?.route?.name === ETradesRoutes.Trades),
        map((state) => getTradesRouteParams(state.route.params)),
    );

    void initSocketListEffects(ctx);

    setupSocket(ctx, routerState$);
    loadTrades(ctx, routerState$);
    initActorDataSourceStatusEffects(ctx);
    setupTabThread(ctx);
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
    const { setTrades } = ModuleHerodotusTrades(ctx);
    const { setTaskId } = ModuleHerodotusTradesState(ctx);
    const getListHerodotusTrades = ModuleGetListHerodotusTradesOnCurrentStage(ctx);

    routeParams$
        .pipe(
            switchMap(({ taskId, robotId, name }) => {
                return isNil(taskId) || isNil(robotId)
                    ? EMPTY
                    : combineLatest([
                          of(taskId),
                          of(name),
                          getListHerodotusTrades(
                              { taskId, robotId },
                              { traceId: generateTraceId() },
                          ).pipe(extractSyncedValueFromValueDescriptor()),
                      ]);
            }),
        )
        .subscribe(([taskId, name, trades]) => {
            setTrades(taskId, trades);
            setTaskId(taskId);
            document.title = name;
        });
}

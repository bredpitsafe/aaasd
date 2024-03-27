import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import { EBalanceMonitorRoute, EBalanceMonitorSearchParams } from './router/def';
import { ModuleBalanceMonitorRouter } from './router/module';

export const ModuleActiveCoin = ModuleFactory((ctx: TContextRef) => {
    const { state$ } = ModuleBalanceMonitorRouter(ctx);

    const activeCoin$ = state$.pipe(
        map(({ route }) => extractRouterParam(route, EBalanceMonitorSearchParams.Coin)),
        distinctUntilChanged(),
        shareReplay(1),
    );

    return {
        activeCoin$,
        setActiveCoin: setActiveCoin.bind(undefined, ctx),
    };
});

function setActiveCoin(ctx: TContextRef, coin: TCoinId | undefined) {
    const { navigate, getState } = ModuleBalanceMonitorRouter(ctx);
    const { getCurrentSocket } = ModuleSocketPage(ctx);

    const socket = getCurrentSocket()?.name;

    if (socket === undefined) {
        throw new Error('Socket not defined');
    }

    return navigate(EBalanceMonitorRoute.BalanceMonitor, {
        ...getState().route.params,
        socket,
        coin,
    });
}

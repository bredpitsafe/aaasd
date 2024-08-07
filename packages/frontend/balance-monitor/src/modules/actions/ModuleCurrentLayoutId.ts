import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import { getLayoutId } from '../../layouts/utils.ts';
import { ModuleBalanceMonitorRouter } from '../router/module.ts';

export const ModuleCurrentLayoutId = ModuleFactory((ctx: TContextRef) => {
    const { state$ } = ModuleBalanceMonitorRouter(ctx);

    const currentLayoutId$ = state$.pipe(
        map(({ route }) => getLayoutId(route.name)),
        distinctUntilChanged(),
        shareReplay(1),
    );

    return { currentLayoutId$ };
});

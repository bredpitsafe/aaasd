import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils.ts';
import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import { EBalanceMonitorSearchParams } from '../router/def.ts';
import { ModuleBalanceMonitorRouter } from '../router/module.ts';

export const ModuleManualTransferFormData = ModuleFactory((ctx: TContextRef) => {
    const { state$ } = ModuleBalanceMonitorRouter(ctx);

    const manualTransferFormData$ = state$.pipe(
        map(({ route }) => extractRouterParam(route, EBalanceMonitorSearchParams.ManualTransfer)),
        distinctUntilChanged(),
        shareReplay(1),
    );

    return { manualTransferFormData$ };
});

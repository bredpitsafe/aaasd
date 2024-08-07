import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import { EInternalTransfersSearchParams } from '../router/def';
import { ModuleBalanceMonitorRouter } from '../router/module';

export const ModuleInternalTransferFormData = ModuleFactory((ctx: TContextRef) => {
    const { state$ } = ModuleBalanceMonitorRouter(ctx);

    const internalTransferFormData$ = state$.pipe(
        map(({ route }) =>
            extractRouterParam(route, EInternalTransfersSearchParams.InternalTransfer),
        ),
        distinctUntilChanged(),
        shareReplay(1),
    );

    return { internalTransferFormData$ };
});

import type { TContextRef } from '@frontend/common/src/di';
import { EDataLoadState } from '@frontend/common/src/types/loadState';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { getDashboardsLoadStateProcedureDescriptor } from '../descriptors';

export function dashboardsLoadStateEffect(ctx: TContextRef, loadedModules$: Observable<unknown>) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);

    register(getDashboardsLoadStateProcedureDescriptor, () =>
        loadedModules$.pipe(
            map(() => createSyncedValueDescriptor(EDataLoadState.Loaded)),
            startWith<TValueDescriptor2<EDataLoadState>>(
                createSyncedValueDescriptor(EDataLoadState.Loading),
            ),
        ),
    );
}

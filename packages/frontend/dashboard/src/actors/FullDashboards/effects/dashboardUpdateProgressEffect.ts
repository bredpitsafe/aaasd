import type { TContextRef } from '@frontend/common/src/di';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SubscribeToDashboardUpdateProgressProcedureDescriptor } from '../descriptors.ts';
import type { UpdateProgress } from './utils/UpdateProgress';

export function dashboardUpdateProgressEffect(
    ctx: TContextRef,
    updateProgress$: Observable<UpdateProgress>,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);

    register(SubscribeToDashboardUpdateProgressProcedureDescriptor, () => {
        return updateProgress$.pipe(
            map((updates) => createSyncedValueDescriptor(updates.getAllUpdates())),
        );
    });
}

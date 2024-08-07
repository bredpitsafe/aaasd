import type { TContextRef } from '@frontend/common/src/di';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import {
    mapValueDescriptor,
    tapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { ModuleDeleteDashboard } from '../actions/dashboardsStorage/deleteDashboard';
import { deleteDashboardProcedureDescriptor } from '../descriptors.ts';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardRemovalEffect(
    ctx: TContextRef,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
    updatesChecker: UpdatesChecker,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const deleteDashboard = ModuleDeleteDashboard(ctx);

    register(deleteDashboardProcedureDescriptor, (dashboardItemKey, options) => {
        if (!isStorageDashboardItemKey(dashboardItemKey)) {
            memoryDashboardsSubject.next(
                DashboardsMemoryCache.remove(memoryDashboardsSubject.getValue(), dashboardItemKey),
            );

            return of(createSyncedValueDescriptor(true as const));
        }

        updateProgressSubject.next(
            UpdateProgress.add(updateProgressSubject.getValue(), dashboardItemKey.storageId),
        );

        return deleteDashboard({ id: dashboardItemKey.storageId }, options).pipe(
            mapValueDescriptor(() => createSyncedValueDescriptor(true as const)),
            tapValueDescriptor(() => {
                updatesChecker.closeSpace(dashboardItemKey.storageId);
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.remove(
                        memoryDashboardsSubject.getValue(),
                        dashboardItemKey,
                    ),
                );
            }),
            finalize(() => {
                updateProgressSubject.next(
                    UpdateProgress.remove(
                        updateProgressSubject.getValue(),
                        dashboardItemKey.storageId,
                    ),
                );
            }),
        );
    });
}

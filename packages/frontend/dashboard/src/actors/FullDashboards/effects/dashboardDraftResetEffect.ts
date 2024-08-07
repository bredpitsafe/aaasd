import type { TContextRef } from '@frontend/common/src/di';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import { tapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import type { TFullStorageDashboard } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboardsStorageItem } from '../../../utils/dashboards';
import { ModuleResetDashboardDraft } from '../actions/dashboardsStorage/resetDashboardDraft';
import { resetDashboardDraftProcedureDescriptor } from '../descriptors.ts';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';

export function dashboardDraftResetEffect(
    ctx: TContextRef,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const resetDashboardDraft = ModuleResetDashboardDraft(ctx);

    register(resetDashboardDraftProcedureDescriptor, (dashboardItemKey, { traceId }) => {
        const memoryDashboards = memoryDashboardsSubject.getValue();
        const memoryDashboard = memoryDashboards.get(dashboardItemKey);
        const originalDashboard = memoryOriginalDashboardsSubject.getValue().get(dashboardItemKey);

        if (
            !isStorageDashboardItemKey(dashboardItemKey) ||
            (!isNil(memoryDashboard) &&
                isReadonlyDashboardsStorageItem((memoryDashboard as TFullStorageDashboard).item))
        ) {
            if (isNil(originalDashboard)) {
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.remove(memoryDashboards, dashboardItemKey),
                );
            } else {
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.set(memoryDashboards, originalDashboard),
                );
            }

            return of(createSyncedValueDescriptor(true as const));
        }

        updateProgressSubject.next(
            UpdateProgress.add(updateProgressSubject.getValue(), dashboardItemKey.storageId),
        );

        return resetDashboardDraft({ id: dashboardItemKey.storageId }, { traceId }).pipe(
            tapValueDescriptor(() => {
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

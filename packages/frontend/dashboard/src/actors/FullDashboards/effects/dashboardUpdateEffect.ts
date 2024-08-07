import type { TContextRef } from '@frontend/common/src/di';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure';
import { createUnsyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ModuleCreateDashboard } from '../../../modules/actions/dashboards/createDashboard';
import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import {
    getDashboardItemKeyFromDashboard,
    isReadonlyDashboardsStorageItem,
} from '../../../utils/dashboards';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { ModuleUpdateDashboard } from '../actions/dashboardsStorage/updateDashboard';
import { updateDashboardProcedureDescriptor } from '../descriptors';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardUpdateEffect(
    ctx: TContextRef,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
    updatesChecker: UpdatesChecker,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const createDashboard = ModuleCreateDashboard(ctx);
    const updateDashboard = ModuleUpdateDashboard(ctx);

    register(updateDashboardProcedureDescriptor, (fullDashboard, { traceId }) => {
        if (
            !isStorageDashboard(fullDashboard) ||
            isReadonlyDashboardsStorageItem(fullDashboard.item)
        ) {
            return createDashboard(
                {
                    name: fullDashboard.dashboard.name,
                    config: convertDashboardToXml(
                        convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
                    ),
                },
                { traceId },
            ).pipe(
                finalize(() => {
                    const dashboardItemKey = getDashboardItemKeyFromDashboard(fullDashboard);

                    const memoryDashboards = memoryDashboardsSubject.getValue();
                    const memoryOriginalDashboards = memoryOriginalDashboardsSubject.getValue();

                    if (isStorageDashboard(fullDashboard)) {
                        memoryDashboardsSubject.next(
                            DashboardsMemoryCache.remove(memoryDashboards, dashboardItemKey),
                        );

                        memoryOriginalDashboardsSubject.next(
                            DashboardsMemoryCache.remove(
                                memoryOriginalDashboards,
                                dashboardItemKey,
                            ),
                        );
                    } else {
                        const originalDashboard = memoryOriginalDashboards.get(dashboardItemKey);

                        memoryDashboardsSubject.next(
                            isNil(originalDashboard)
                                ? DashboardsMemoryCache.remove(memoryDashboards, dashboardItemKey)
                                : DashboardsMemoryCache.set(memoryDashboards, originalDashboard),
                        );
                    }
                }),
            );
        }

        const { id } = fullDashboard.item;
        const currentUpdates = updateProgressSubject.getValue();

        if (currentUpdates.has(id)) {
            return of(
                createUnsyncedValueDescriptor(
                    Fail(EGrpcErrorCode.ABORTED, {
                        message: `Can't update dashboard`,
                        description: `Another update for dashboard ID "${id}" is in progress`,
                    }),
                ),
            );
        }

        updateProgressSubject.next(UpdateProgress.add(currentUpdates, id));

        return updateDashboard(
            {
                id,
                name: fullDashboard.item.name,
                config: convertDashboardToXml(
                    convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
                ),
                status: fullDashboard.item.status,
                digest: fullDashboard.item.digest,
            },
            { traceId },
        ).pipe(
            finalize(() => {
                updatesChecker.clearSpace(id);

                updateProgressSubject.next(
                    UpdateProgress.remove(updateProgressSubject.getValue(), id),
                );
            }),
        );
    });
}

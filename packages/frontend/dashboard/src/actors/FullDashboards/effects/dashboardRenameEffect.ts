import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import { switchMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { finalize, first } from 'rxjs/operators';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboard } from '../../../utils/dashboards';
import { ModuleRenameDashboard } from '../actions/dashboardsStorage/renameDashboard';
import { renameDashboardProcedureDescriptor } from '../descriptors.ts';
import { subscribeToStorageDashboard } from './dashboardEffect';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardRenameEffect(
    ctx: TContextRef,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const renameDashboard = ModuleRenameDashboard(ctx);

    register(renameDashboardProcedureDescriptor, ({ dashboardItemKey, name }, { traceId }) => {
        if (!isStorageDashboardItemKey(dashboardItemKey)) {
            const memoryDashboards = memoryDashboardsSubject.getValue();
            const memoryDashboard = memoryDashboards.get(dashboardItemKey);

            if (isNil(memoryDashboard)) {
                return of(
                    createUnsyncedValueDescriptor(
                        Fail(EGrpcErrorCode.NOT_FOUND, {
                            message: 'Memory dashboard was removed',
                            description: undefined,
                            traceId,
                        }),
                    ),
                );
            }

            updateMemoryDashboardName(memoryDashboardsSubject, memoryDashboard, name);

            return of(createSyncedValueDescriptor(true as const));
        }

        const memoryDashboards = memoryDashboardsSubject.getValue();
        const memoryDashboard = memoryDashboards.get(dashboardItemKey);

        if (!isNil(memoryDashboard) && isReadonlyDashboard(memoryDashboard)) {
            updateMemoryDashboardName(memoryDashboardsSubject, memoryDashboard, name);

            return of(createSyncedValueDescriptor(true as const));
        }

        return subscribeToStorageDashboard(
            ctx,
            dashboardItemKey,
            updatesChecker,
            memoryDashboardsSubject,
        ).pipe(
            first((vd) => isSyncedValueDescriptor(vd) || isFailValueDescriptor(vd)),
            switchMapValueDescriptor(({ value: fullDashboard }) => {
                if (isReadonlyDashboard(fullDashboard)) {
                    const memoryDashboards = memoryDashboardsSubject.getValue();
                    const memoryDashboard = memoryDashboards.get(dashboardItemKey);

                    updateMemoryDashboardName(
                        memoryDashboardsSubject,
                        memoryDashboard ?? fullDashboard,
                        name,
                    );

                    return of(createSyncedValueDescriptor(true as const));
                }

                updateProgressSubject.next(
                    UpdateProgress.add(
                        updateProgressSubject.getValue(),
                        dashboardItemKey.storageId,
                    ),
                );

                return renameDashboard({ id: dashboardItemKey.storageId, name }, { traceId }).pipe(
                    finalize(() => {
                        updateProgressSubject.next(
                            UpdateProgress.remove(
                                updateProgressSubject.getValue(),
                                dashboardItemKey.storageId,
                            ),
                        );
                    }),
                );
            }),
        );
    });
}

function updateMemoryDashboardName(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    fullDashboard: TFullDashboard,
    name: TStorageDashboardName,
) {
    memoryDashboardsSubject.next(
        DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), {
            ...fullDashboard,
            item: {
                ...fullDashboard.item,
                name,
                hasDraft: true,
            },
            dashboard: {
                ...fullDashboard.dashboard,
                name,
            },
        } as TFullDashboard),
    );
}

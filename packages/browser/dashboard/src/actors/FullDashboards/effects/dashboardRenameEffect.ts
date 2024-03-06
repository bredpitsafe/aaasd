import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { toSwitch } from '@frontend/common/src/utils/Rx/dynamicMap';
import { dynamicMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { BehaviorSubject, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import type { TFullDashboard } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboard } from '../../../utils/dashboards';
import { createDashboardSubscriptionFactory } from '../actions/dashboardsStorage/createDashboardSubscriptionFactory';
import { fetchDashboardConfigFactory } from '../actions/dashboardsStorage/fetchDashboardConfigFactory';
import { fetchDashboardDraftFactory } from '../actions/dashboardsStorage/fetchDashboardDraftFactory';
import { renameDashboard } from '../actions/dashboardsStorage/renameDashboard';
import { renameDashboardEnvBox } from '../envelope';
import { getStorageDashboard } from './dashboardEffect';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardRenameEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    getDashboard$: ReturnType<typeof createDashboardSubscriptionFactory>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
    fetchDashboardConfig$: ReturnType<typeof fetchDashboardConfigFactory>,
    fetchDashboardDraft$: ReturnType<typeof fetchDashboardDraftFactory>,
) {
    renameDashboardEnvBox.responseStream(
        context,
        ({ traceId, props: { dashboardItemKey, name } }) => {
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

            return getStorageDashboard(
                dashboardItemKey,
                updatesChecker,
                memoryDashboardsSubject,
                getDashboard$,
                fetchDashboardConfig$,
                fetchDashboardDraft$,
            ).pipe(
                dynamicMapValueDescriptor(({ value: fullDashboard }) => {
                    if (isReadonlyDashboard(fullDashboard)) {
                        const memoryDashboards = memoryDashboardsSubject.getValue();
                        const memoryDashboard = memoryDashboards.get(dashboardItemKey);

                        updateMemoryDashboardName(
                            memoryDashboardsSubject,
                            memoryDashboard ?? fullDashboard,
                            name,
                        );

                        return toSwitch(of(createSyncedValueDescriptor(true as const)));
                    }

                    updateProgressSubject.next(
                        UpdateProgress.add(
                            updateProgressSubject.getValue(),
                            dashboardItemKey.storageId,
                        ),
                    );

                    return toSwitch(
                        renameDashboard(ctx, traceId, dashboardItemKey.storageId, name).pipe(
                            finalize(() => {
                                updateProgressSubject.next(
                                    UpdateProgress.remove(
                                        updateProgressSubject.getValue(),
                                        dashboardItemKey.storageId,
                                    ),
                                );
                            }),
                        ),
                    );
                }),
            );
        },
    );
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

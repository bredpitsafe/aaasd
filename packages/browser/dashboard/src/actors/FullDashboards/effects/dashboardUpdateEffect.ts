import type { TContextRef } from '@frontend/common/src/di';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { BehaviorSubject, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import {
    getDashboardItemKeyFromDashboard,
    isReadonlyDashboardsStorageItem,
} from '../../../utils/dashboards';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { createDashboard } from '../actions/dashboardsStorage/createDashboard';
import { updateDashboard } from '../actions/dashboardsStorage/updateDashboard';
import { updateDashboardEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import type { UpdatesChecker } from './utils/UpdatesChecker';

const createFail = FailFactory('UpdateDashboard');
const descFactory = ValueDescriptorFactory<
    TDashboardItemKey,
    TDashboardActionFailDesc<'UpdateDashboard'> | TFail<'[UpdateDashboard]: UPDATE_IN_PROGRESS'>
>();

export type TUpdateDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardUpdateEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
    updatesChecker: UpdatesChecker,
) {
    const { error } = ModuleNotifications(ctx);

    updateDashboardEnvBox.responseStream(context, ({ traceId, fullDashboard }) => {
        if (
            !isStorageDashboard(fullDashboard) ||
            isReadonlyDashboardsStorageItem(fullDashboard.item)
        ) {
            return createDashboard(
                ctx,
                traceId,
                fullDashboard.dashboard.name,
                convertDashboardToXml(
                    convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
                ),
                undefined,
                undefined,
            ).pipe(
                mapDesc({
                    idle: () => descFactory.idle(),
                    unsynchronized: () => descFactory.unsc(null),
                    synchronized: (storageId) => descFactory.sync({ storageId }, null),
                    fail: ({ code, meta }) => {
                        switch (code) {
                            case '[CreateServerDashboard]: UNKNOWN':
                                return descFactory.fail(createFail('UNKNOWN', meta));
                            case '[CreateServerDashboard]: SERVER_NOT_PROCESSED':
                                return descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta));
                            default:
                                assertNever(code);
                        }
                    },
                }),
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

        const {
            item: { id },
        } = fullDashboard;

        const dashboardItemKey = getDashboardItemKeyFromDashboard(fullDashboard);
        const currentUpdates = updateProgressSubject.getValue();

        if (currentUpdates.has(id)) {
            error({
                message: `Can't update dashboard`,
                description: `Another update for dashboard ID "${id}" is in progress`,
            });
            return of(descFactory.fail(createFail('UPDATE_IN_PROGRESS')));
        }

        updateProgressSubject.next(UpdateProgress.add(currentUpdates, id));

        return updateDashboard(
            ctx,
            traceId,
            id,
            fullDashboard.item.name,
            convertDashboardToXml(
                convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
            ),
            fullDashboard.item.status,
            fullDashboard.item.digest,
        ).pipe(
            mapDesc({
                idle: () => descFactory.idle(),
                unsynchronized: () => descFactory.unsc(null),
                synchronized: () => descFactory.sync(dashboardItemKey, null),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[UpdateServerDashboard]: UNKNOWN':
                            return descFactory.fail(createFail('UNKNOWN', meta));
                        case '[UpdateServerDashboard]: NOT_FOUND':
                            return descFactory.fail(createFail('NOT_FOUND', meta));
                        case '[UpdateServerDashboard]: AUTHORIZATION':
                            return descFactory.fail(createFail('AUTHORIZATION', meta));
                        case '[UpdateServerDashboard]: SERVER_NOT_PROCESSED':
                            return descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta));
                        default:
                            assertNever(code);
                    }
                },
            }),
            finalize(() => {
                updatesChecker.clearSpace(id);

                updateProgressSubject.next(
                    UpdateProgress.remove(updateProgressSubject.getValue(), id),
                );
            }),
        );
    });
}

import type { TContextRef } from '@frontend/common/src/di';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { BehaviorSubject, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { deleteDashboard } from '../actions/dashboardsStorage/deleteDashboard';
import { deleteDashboardEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';
import type { UpdatesChecker } from './utils/UpdatesChecker';

const createFail = FailFactory('DeleteDashboard');
const descFactory = ValueDescriptorFactory<true, TDashboardActionFailDesc<'DeleteDashboard'>>();

export type TDeleteDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardRemovalEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
    updatesChecker: UpdatesChecker,
) {
    deleteDashboardEnvBox.responseStream(context, ({ traceId, dashboardItemKey }) => {
        if (!isStorageDashboardItemKey(dashboardItemKey)) {
            memoryDashboardsSubject.next(
                DashboardsMemoryCache.remove(memoryDashboardsSubject.getValue(), dashboardItemKey),
            );

            return of(descFactory.sync(true, null));
        }

        updateProgressSubject.next(
            UpdateProgress.add(updateProgressSubject.getValue(), dashboardItemKey.storageId),
        );

        return deleteDashboard(ctx, traceId, dashboardItemKey.storageId).pipe(
            tap(() => {
                updatesChecker.closeSpace(dashboardItemKey.storageId);
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.remove(
                        memoryDashboardsSubject.getValue(),
                        dashboardItemKey,
                    ),
                );
            }),
            mapDesc({
                idle: () => descFactory.idle(),
                unsynchronized: () => descFactory.unsc(null),
                synchronized: (value) => descFactory.sync(value, null),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[DeleteServerDashboard]: UNKNOWN':
                            return descFactory.fail(createFail('UNKNOWN', meta));
                        case '[DeleteServerDashboard]: NOT_FOUND':
                            return descFactory.fail(createFail('NOT_FOUND', meta));
                        case '[DeleteServerDashboard]: AUTHORIZATION':
                            return descFactory.fail(createFail('AUTHORIZATION', meta));
                        case '[DeleteServerDashboard]: SERVER_NOT_PROCESSED':
                            return descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta));
                        default:
                            assertNever(code);
                    }
                },
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

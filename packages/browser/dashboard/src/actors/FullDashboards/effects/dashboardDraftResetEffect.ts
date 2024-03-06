import type { TContextRef } from '@frontend/common/src/di';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { BehaviorSubject, of, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import type { TFullStorageDashboard } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboardsStorageItem } from '../../../utils/dashboards';
import { resetDashboardDraft } from '../actions/dashboardsStorage/resetDashboardDraft';
import { resetDashboardDraftEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import { UpdateProgress } from './utils/UpdateProgress';

const createFail = FailFactory('ResetDashboardDraft');
const descFactory = ValueDescriptorFactory<true, TDashboardActionFailDesc<'ResetDashboardDraft'>>();

export type TResetDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardDraftResetEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updateProgressSubject: BehaviorSubject<UpdateProgress>,
) {
    resetDashboardDraftEnvBox.responseStream(context, ({ traceId, dashboardItemKey }) => {
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

            return of(descFactory.sync(true, null));
        }

        updateProgressSubject.next(
            UpdateProgress.add(updateProgressSubject.getValue(), dashboardItemKey.storageId),
        );

        return resetDashboardDraft(ctx, traceId, dashboardItemKey.storageId).pipe(
            tap(() =>
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.remove(
                        memoryDashboardsSubject.getValue(),
                        dashboardItemKey,
                    ),
                ),
            ),
            mapDesc({
                idle: () => descFactory.idle(),
                unsynchronized: () => descFactory.unsc(null),
                synchronized: (value) => descFactory.sync(value, null),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[ResetServerDashboardDraft]: UNKNOWN':
                            return descFactory.fail(createFail('UNKNOWN', meta));
                        case '[ResetServerDashboardDraft]: NOT_FOUND':
                            return descFactory.fail(createFail('NOT_FOUND', meta));
                        case '[ResetServerDashboardDraft]: AUTHORIZATION':
                            return descFactory.fail(createFail('AUTHORIZATION', meta));
                        case '[ResetServerDashboardDraft]: SERVER_NOT_PROCESSED':
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

import { seconds2milliseconds, toSeconds } from '@common/utils';
import type { TContextRef } from '@frontend/common/src/di';
import type { TWithTraceId } from '@frontend/common/src/modules/actions/def.ts';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage.ts';
import { dedobs } from '@frontend/common/src/utils/observable/memo.ts';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import {
    convertErrToGrpcFail,
    convertGrpcFailToGrpcError,
} from '@frontend/common/src/utils/ValueDescriptor/Fails.ts';
import type { TUnsyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
    isUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { BehaviorSubject } from 'rxjs';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, filter, groupBy, mergeMap, switchMap } from 'rxjs/operators';

import type { TFullDashboard, TFullStorageDashboard } from '../../../types/fullDashboard';
import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboardsStorageItem } from '../../../utils/dashboards';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { ModuleUpdateDashboardDraft } from '../actions/dashboardsStorage/updateDashboardDraft';
import { updateDashboardDraftProcedureDescriptor } from '../descriptors.ts';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

const DEBOUNCE_UPDATE = seconds2milliseconds(toSeconds(1));

export function dashboardDraftUpdateEffect(
    ctx: TContextRef,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updatesChecker: UpdatesChecker,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const updateDashboardDraft = ModuleUpdateDashboardDraft(ctx);
    const updatesQueue = new Subject<TWithTraceId & { fullDashboard: TFullStorageDashboard }>();

    const getUpdateProcessor = dedobs(
        () =>
            updatesQueue.pipe(
                groupBy(({ fullDashboard }) => fullDashboard.storageDashboardItemKey.storageId),
                mergeMap((group) =>
                    group.pipe(
                        debounceTime(DEBOUNCE_UPDATE),
                        switchMap(({ traceId, fullDashboard }) => {
                            const config = convertDashboardToXml(
                                convertDashboardToExportableDashboardConfig(
                                    fullDashboard.dashboard,
                                ),
                            );

                            const { storageId } = fullDashboard.storageDashboardItemKey;

                            updatesChecker.registerUpdate(storageId, config);

                            return updateDashboardDraft(
                                {
                                    id: fullDashboard.storageDashboardItemKey.storageId,
                                    config,
                                },
                                { traceId },
                            ).pipe(
                                mapValueDescriptor({
                                    synced: () => createSyncedValueDescriptor(storageId),
                                    unsynced: (vd) =>
                                        createUnsyncedValueDescriptor(storageId, vd.fail, vd.meta),
                                }),
                                catchError((error) => {
                                    return of(
                                        createUnsyncedValueDescriptor(
                                            storageId,
                                            convertErrToGrpcFail(error),
                                        ),
                                    );
                                }),
                            );
                        }),
                    ),
                ),
            ),
        { removeDelay: 0, resetDelay: 0 },
    );

    register(updateDashboardDraftProcedureDescriptor, (fullDashboard, { traceId }) => {
        if (
            !isStorageDashboard(fullDashboard) ||
            isReadonlyDashboardsStorageItem(fullDashboard.item)
        ) {
            const newFullDashboard = fullDashboard.item.hasDraft
                ? fullDashboard
                : ({
                      ...fullDashboard,
                      item: {
                          ...fullDashboard.item,
                          hasDraft: true,
                      },
                  } as TFullDashboard);

            memoryDashboardsSubject.next(
                DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), newFullDashboard),
            );

            return of(createSyncedValueDescriptor(true as const));
        }

        memoryDashboardsSubject.next(
            DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), fullDashboard),
        );

        return new Observable((subscriber) => {
            const isSameDashboard = (id: null | TStorageDashboardId) =>
                id === fullDashboard.storageDashboardItemKey.storageId;
            const updateProcessorSub = getUpdateProcessor()
                .pipe(filter(({ value }) => isSameDashboard(value)))
                .subscribe({
                    next: (descriptor) => {
                        if (isSyncedValueDescriptor(descriptor)) {
                            subscriber.next(createSyncedValueDescriptor(true as const));
                            subscriber.complete();
                        } else if (isFailValueDescriptor(descriptor)) {
                            subscriber.error(convertGrpcFailToGrpcError(descriptor.fail));
                        } else if (isUnsyncedValueDescriptor(descriptor)) {
                            return subscriber.next(descriptor as TUnsyncedValueDescriptor);
                        } else {
                            throw new Error('Unexpected value descriptor');
                        }
                    },
                    error: (error) => subscriber.error(error),
                    complete: () => subscriber.complete(),
                });

            updatesQueue.next({ traceId, fullDashboard });

            const updatesQueueSub = updatesQueue
                .pipe(
                    filter(({ fullDashboard }) =>
                        isSameDashboard(fullDashboard.storageDashboardItemKey.storageId),
                    ),
                )
                .subscribe(() => {
                    // someone else updated the same dashboard
                    subscriber.complete();
                });

            return () => {
                updateProcessorSub.unsubscribe();
                updatesQueueSub.unsubscribe();
            };
        });
    });
}

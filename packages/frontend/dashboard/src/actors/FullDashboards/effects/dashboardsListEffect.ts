import { shareReplayWithDelayedReset } from '@common/rx';
import { generateTraceId } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardListItem } from '@frontend/common/src/types/domain/dashboardsStorage';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
    squashValueDescriptors,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    EMPTY_VD,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { differenceBy, isEmpty, isNil } from 'lodash-es';
import type { BehaviorSubject, MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, scan } from 'rxjs/operators';

import type { TDashboardItem, TStorageDashboardItemKey } from '../../../types/fullDashboard';
import {
    isIndicatorsDashboard,
    isRobotDashboard,
    isStorageDashboard,
    isStorageDashboardItem,
} from '../../../types/fullDashboard/guards';
import {
    areDashboardItemKeysEqual,
    getDashboardItemKeyFromItem,
    isReadonlyDashboardsStorageItem,
} from '../../../utils/dashboards';
import { ModuleSubscribeToDashboardsList } from '../actions/dashboardsStorage/createDashboardsListSubscriptionFactory';
import { getDashboardsListProcedureDescriptor } from '../descriptors';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardsListEffect(
    ctx: TContextRef,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
) {
    const traceId = generateTraceId();
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const getDashboardsList = ModuleSubscribeToDashboardsList(ctx);

    register(getDashboardsListProcedureDescriptor, (params) => {
        return combineLatest([
            getMemoryExternalDashboards(memoryDashboardsSubject).pipe(
                map(createSyncedValueDescriptor),
            ),
            getDashboardsList(params ?? {}, { traceId }).pipe(
                distinctValueDescriptorUntilChanged(),
                updateDashboardsCache(
                    updatesChecker,
                    memoryDashboardsSubject,
                    memoryOriginalDashboardsSubject,
                ),
                restoreReadonlyDashboardDrafts(memoryDashboardsSubject),
            ),
        ]).pipe(
            squashValueDescriptors(),
            mapValueDescriptor(({ value: [externalDashboards, storageDashboards] }) => {
                return createSyncedValueDescriptor(
                    getCombinedDashboards(storageDashboards, externalDashboards),
                );
            }),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    });
}

function getMemoryExternalDashboards(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): Observable<TDashboardItem[]> {
    return memoryDashboardsSubject.pipe(
        map((cache) => cache.getAll()),
        map((memoryDashboards) =>
            memoryDashboards.map((fullDashboard) => {
                if (isRobotDashboard(fullDashboard)) {
                    return {
                        robotDashboardKey: fullDashboard.robotDashboardKey,
                        item: fullDashboard.item,
                        name: fullDashboard.dashboard.name,
                    };
                }

                if (isIndicatorsDashboard(fullDashboard)) {
                    return {
                        indicatorsDashboardKey: fullDashboard.indicatorsDashboardKey,
                        item: fullDashboard.item,
                        name: fullDashboard.dashboard.name,
                    };
                }

                if (isStorageDashboard(fullDashboard)) {
                    return {
                        storageDashboardItemKey: fullDashboard.storageDashboardItemKey,
                        item: fullDashboard.item,
                        name: fullDashboard.dashboard.name,
                    };
                }

                assertNever(fullDashboard);
            }),
        ),
    );
}

function updateDashboardsCache(
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): MonoTypeOperatorFunction<TValueDescriptor2<TStorageDashboardListItem[]>> {
    return scan(
        (previousDescriptor, currentDescriptor) => {
            if (!isSyncedValueDescriptor(previousDescriptor)) {
                return currentDescriptor;
            }
            if (!isSyncedValueDescriptor(currentDescriptor)) {
                return previousDescriptor;
            }

            const { value: previous } = previousDescriptor;
            const { value: current } = currentDescriptor;

            const originalDraftDashboards = memoryDashboardsSubject.getValue();
            let draftDashboards = originalDraftDashboards;
            let originalDashboards = memoryOriginalDashboardsSubject.getValue();

            const removedItems = differenceBy(previous, current, ({ id }) => id);

            if (!isEmpty(removedItems)) {
                // Remove disappeared items from cache
                removedItems.forEach(({ id }) => {
                    updatesChecker.closeSpace(id);

                    const dashboardItemKey: TStorageDashboardItemKey = { storageId: id };

                    draftDashboards = DashboardsMemoryCache.remove(
                        draftDashboards,
                        dashboardItemKey,
                    );
                    originalDashboards = DashboardsMemoryCache.remove(
                        originalDashboards,
                        dashboardItemKey,
                    );
                });

                memoryOriginalDashboardsSubject.next(originalDashboards);
            }

            for (const dashboardListItem of current) {
                if (!isReadonlyDashboardsStorageItem(dashboardListItem)) {
                    continue;
                }

                // Reset user draft for readonly updated items
                const dashboardItemKey: TStorageDashboardItemKey = {
                    storageId: dashboardListItem.id,
                };

                const draftDashboard = draftDashboards.get(dashboardItemKey);

                if (
                    isNil(draftDashboard) ||
                    draftDashboard.item.digest === dashboardListItem.digest
                ) {
                    continue;
                }

                draftDashboards = DashboardsMemoryCache.remove(draftDashboards, dashboardItemKey);
            }

            if (originalDraftDashboards !== draftDashboards) {
                memoryDashboardsSubject.next(draftDashboards);
            }

            return currentDescriptor;
        },
        EMPTY_VD as TValueDescriptor2<TStorageDashboardListItem[]>,
    );
}

function restoreReadonlyDashboardDrafts(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): OperatorFunction<
    TValueDescriptor2<TStorageDashboardListItem[]>,
    TValueDescriptor2<TDashboardItem[]>
> {
    return switchMapValueDescriptor(({ value: serverList }) =>
        memoryDashboardsSubject.pipe(
            map((cache) => {
                const list = serverList.map((serverListItem) => {
                    const dashboardItem =
                        cache.get({ storageId: serverListItem.id })?.item ?? serverListItem;

                    return {
                        storageDashboardItemKey: {
                            storageId: dashboardItem.id,
                        },
                        item: dashboardItem,
                        name: dashboardItem.name,
                    };
                });

                return createSyncedValueDescriptor(list);
            }),
        ),
    );
}
/**
 * Combines storage dashboards with external **storage** dashboards based on their keys.
 * Result is all storage dashboards that may be overwritten by externalDashboards if their keys match.
 *
 * @remarks
 * If externalDashboards contains storage-type items that are not present in storageDashboards (comparing by dashboard key),
 * they are filtered out and not included into a resulting array.
 * Other non-storage dashboard types (robot, indicator, etc.) are appended to the output as-is.
 */
function getCombinedDashboards(
    storageDashboards: TDashboardItem[],
    externalDashboards: TDashboardItem[],
) {
    return storageDashboards
        .map((storageDashboard) => {
            const storageDashboardKey = getDashboardItemKeyFromItem(storageDashboard);
            const externalDashboard = externalDashboards.find((externalDashboard) => {
                const externalDashboardKey = getDashboardItemKeyFromItem(externalDashboard);
                return (
                    isStorageDashboardItem(externalDashboard) &&
                    areDashboardItemKeysEqual(storageDashboardKey, externalDashboardKey)
                );
            });

            return externalDashboard ?? storageDashboard;
        })
        .concat(
            externalDashboards.filter(
                (externalDashboard) => !isStorageDashboardItem(externalDashboard),
            ),
        );
}

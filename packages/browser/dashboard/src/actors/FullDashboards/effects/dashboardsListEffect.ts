import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { distinctDescUntilChanged, switchMapDesc } from '@frontend/common/src/utils/Rx/desc';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import {
    ExtractValueDescriptor,
    IdleDesc,
    isSyncDesc,
    matchDesc,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { differenceBy, isEmpty, isNil } from 'lodash-es';
import {
    BehaviorSubject,
    combineLatest,
    MonoTypeOperatorFunction,
    Observable,
    of,
    OperatorFunction,
} from 'rxjs';
import { map, scan } from 'rxjs/operators';
import type { EnvelopeTransmitter } from 'webactor';

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
import type {
    createDashboardsListSubscriptionFactory,
    TSubscribeServerDashboardListReturnType,
} from '../actions/dashboardsStorage/createDashboardsListSubscriptionFactory';
import { getDashboardsListEnvBox } from '../envelope';
import type { TCommonFailDesc } from '../types';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

const createFail = FailFactory('SubscribeDashboardList');
const descFactory = ValueDescriptorFactory<
    TDashboardItem[],
    TCommonFailDesc<'SubscribeDashboardList'>
>();

export type TSubscribeDashboardListReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardsListEffect(
    context: EnvelopeTransmitter,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    getDashboardsList$: ReturnType<typeof createDashboardsListSubscriptionFactory>,
) {
    getDashboardsListEnvBox.responseStream(context, () => {
        return combineLatest([
            getMemoryExternalDashboards(memoryDashboardsSubject),
            getDashboardsList$().pipe(
                distinctDescUntilChanged(),
                updateDashboardsCache(
                    updatesChecker,
                    memoryDashboardsSubject,
                    memoryOriginalDashboardsSubject,
                ),
                restoreReadonlyDashboardDrafts(memoryDashboardsSubject),
            ),
        ]).pipe(
            map(([externalDashboards, storageDashboardsDescriptor]) =>
                matchDesc(storageDashboardsDescriptor, {
                    idle: () => descFactory.idle(),
                    unsynchronized: () => descFactory.unsc(null),
                    synchronized: (storageDashboards) =>
                        descFactory.sync(
                            [
                                ...externalDashboards,
                                ...getNonDirtyStorageDashboards(
                                    storageDashboards,
                                    externalDashboards,
                                ),
                            ],
                            null,
                        ),
                    fail: (fail) => descFactory.fail(fail),
                }),
            ),
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
): MonoTypeOperatorFunction<TSubscribeServerDashboardListReturnType> {
    return scan((previousDescriptor, currentDescriptor) => {
        if (!isSyncDesc(previousDescriptor)) {
            return currentDescriptor;
        }
        if (!isSyncDesc(currentDescriptor)) {
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

                draftDashboards = DashboardsMemoryCache.remove(draftDashboards, dashboardItemKey);
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

            if (isNil(draftDashboard) || draftDashboard.item.digest === dashboardListItem.digest) {
                continue;
            }

            draftDashboards = DashboardsMemoryCache.remove(draftDashboards, dashboardItemKey);
        }

        if (originalDraftDashboards !== draftDashboards) {
            memoryDashboardsSubject.next(draftDashboards);
        }

        return currentDescriptor;
    }, IdleDesc() as TSubscribeServerDashboardListReturnType);
}

function restoreReadonlyDashboardDrafts(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): OperatorFunction<TSubscribeServerDashboardListReturnType, TSubscribeDashboardListReturnType> {
    return switchMapDesc({
        idle: () => of(descFactory.idle()),
        unsynchronized: () => of(descFactory.unsc(null)),
        synchronized: (serverList) =>
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

                    return descFactory.sync(list, null);
                }),
            ),
        fail: ({ code, meta }) => {
            switch (code) {
                case '[SubscribeServerDashboardList]: UNKNOWN':
                    return of(descFactory.fail(createFail('UNKNOWN', meta)));
                case '[SubscribeServerDashboardList]: SERVER_NOT_PROCESSED':
                    return of(descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta)));
                default:
                    assertNever(code);
            }
        },
    });
}

function getNonDirtyStorageDashboards(
    storageDashboards: TDashboardItem[],
    externalDashboards: TDashboardItem[],
) {
    const dirtyStorageDashboardsItemKeys = externalDashboards
        .filter((externalDashboardItem) => isStorageDashboardItem(externalDashboardItem))
        .map((item) => getDashboardItemKeyFromItem(item));

    return storageDashboards.filter((dashboardItem) =>
        dirtyStorageDashboardsItemKeys.every(
            (externalDashboardItemKey) =>
                !areDashboardItemKeysEqual(
                    getDashboardItemKeyFromItem(dashboardItem),
                    externalDashboardItemKey,
                ),
        ),
    );
}

import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type {
    TStorageDashboard,
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { assertNever } from '@frontend/common/src/utils/assert';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { toMerge, toSwitch } from '@frontend/common/src/utils/Rx/dynamicMap';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import {
    distinctValueDescriptorUntilChanged,
    dynamicMapValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { BehaviorSubject, from, Observable, of, pipe, UnaryFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { EnvelopeTransmitter } from 'webactor';

import type {
    TFullDashboard,
    TFullStorageDashboard,
    TStorageDashboardItemKey,
} from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
    isStorageDashboardItemKey,
} from '../../../types/fullDashboard/guards';
import { isReadonlyDashboardsStorageItem } from '../../../utils/dashboards';
import { convertXMLToDashboard } from '../../../utils/dashboards/converters';
import { createDashboardSubscriptionFactory } from '../actions/dashboardsStorage/createDashboardSubscriptionFactory';
import type { fetchDashboardConfigFactory } from '../actions/dashboardsStorage/fetchDashboardConfigFactory';
import type { fetchDashboardDraftFactory } from '../actions/dashboardsStorage/fetchDashboardDraftFactory';
import { getDashboardEnvBox } from '../envelope';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardEffect(
    context: EnvelopeTransmitter,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    getDashboard$: ReturnType<typeof createDashboardSubscriptionFactory>,
    fetchDashboardConfig$: ReturnType<typeof fetchDashboardConfigFactory>,
    fetchDashboardDraft$: ReturnType<typeof fetchDashboardDraftFactory>,
) {
    const storageDashboards$ = (
        dashboardItemKey: TStorageDashboardItemKey,
    ): Observable<TValueDescriptor2<TFullDashboard>> =>
        getStorageDashboard(
            dashboardItemKey,
            updatesChecker,
            memoryDashboardsSubject,
            getDashboard$,
            fetchDashboardConfig$,
            fetchDashboardDraft$,
        );

    getDashboardEnvBox.responseStream(context, (dashboardItemKey) => {
        if (isStorageDashboardItemKey(dashboardItemKey)) {
            return storageDashboards$(dashboardItemKey);
        }

        if (
            isRobotDashboardItemKey(dashboardItemKey) ||
            isIndicatorsDashboardItemKey(dashboardItemKey)
        ) {
            return memoryDashboardsSubject.pipe(
                map((cache): TFullDashboard | undefined => cache.get(dashboardItemKey)),
                map((fullDashboard) =>
                    isNil(fullDashboard)
                        ? createUnsyncedValueDescriptor(
                              Fail(EGrpcErrorCode.NOT_FOUND, {
                                  message: 'Can not find dashboard',
                              }),
                          )
                        : createSyncedValueDescriptor(fullDashboard),
                ),
            );
        }

        assertNever(dashboardItemKey);
    });
}

export const getStorageDashboard = dedobs(
    (
        dashboardItemKey: TStorageDashboardItemKey,
        updatesChecker: UpdatesChecker,
        memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
        getDashboard$: ReturnType<typeof createDashboardSubscriptionFactory>,
        fetchDashboardConfig$: ReturnType<typeof fetchDashboardConfigFactory>,
        fetchDashboardDraft$: ReturnType<typeof fetchDashboardDraftFactory>,
    ): Observable<TValueDescriptor2<TFullDashboard>> => {
        updatesChecker.openSpace(dashboardItemKey.storageId);

        return getDashboard$(dashboardItemKey.storageId).pipe(
            updateCacheAndFilterUpdates(
                dashboardItemKey,
                updatesChecker,
                memoryDashboardsSubject,
                fetchDashboardConfig$,
                fetchDashboardDraft$,
            ),
            shareReplayWithImmediateReset(),
        );
    },
    {
        normalize: ([
            dashboardItemKey,
            updatesChecker,
            memoryDashboardsSubject,
            getDashboard$,
            fetchDashboardConfig$,
            fetchDashboardDraft$,
        ]) => {
            return semanticHash.get(
                {
                    dashboardItemKey,
                    updatesChecker,
                    memoryDashboardsSubject,
                    getDashboard$,
                    fetchDashboardConfig$,
                    fetchDashboardDraft$,
                },
                {
                    dashboardItemKey: semanticHash.withHasher<TStorageDashboardItemKey>(
                        (v) => v.storageId,
                    ),
                    updatesChecker: semanticHash.withHasher(shallowHash),
                    memoryDashboardsSubject: semanticHash.withHasher(shallowHash),
                    getDashboard$: semanticHash.withHasher(shallowHash),
                    fetchDashboardConfig$: semanticHash.withHasher(shallowHash),
                    fetchDashboardDraft$: semanticHash.withHasher(shallowHash),
                },
            );
        },
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

function updateCacheAndFilterUpdates(
    dashboardItemKey: TStorageDashboardItemKey,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    fetchDashboardConfig$: ReturnType<typeof fetchDashboardConfigFactory>,
    fetchDashboardDraft$: ReturnType<typeof fetchDashboardDraftFactory>,
): UnaryFunction<
    Observable<TValueDescriptor2<TStorageDashboard>>,
    Observable<TValueDescriptor2<TFullDashboard>>
> {
    let isFirstResponse = true;

    return pipe(
        distinctValueDescriptorUntilChanged(),
        dynamicMapValueDescriptor({
            synced: ({ value: storageItem }) => {
                isFirstResponse = false;

                const fullDashboard$ = storageItem.hasDraft
                    ? getDraftWithFilter(
                          storageItem,
                          memoryDashboardsSubject,
                          fetchDashboardDraft$,
                          updatesChecker,
                      )
                    : getConfig(
                          storageItem,
                          memoryDashboardsSubject,
                          fetchDashboardConfig$,
                          updatesChecker,
                      );

                return toSwitch(
                    fullDashboard$.pipe(
                        distinctValueDescriptorUntilChanged(),
                        dynamicMapValueDescriptor(({ value: fullDashboard }) =>
                            toSwitch(
                                memoryDashboardsSubject.pipe(
                                    map((cache) => cache.get(dashboardItemKey)),
                                    map((memoryDashboard) =>
                                        createSyncedValueDescriptor(
                                            memoryDashboard ??
                                                fixDashboardName(fullDashboard, storageItem.name),
                                        ),
                                    ),
                                    distinctValueDescriptorUntilChanged(),
                                ),
                            ),
                        ),
                    ),
                );
            },
            unsynced: (vd) => {
                if (vd.fail?.code === EGrpcErrorCode.PERMISSION_DENIED && !isFirstResponse) {
                    // TODO: how to correct describe this workaround for user?
                    return toMerge(
                        of(
                            createUnsyncedValueDescriptor(
                                Fail(EGrpcErrorCode.NOT_FOUND, {
                                    message: 'Can not find dashboard',
                                }),
                            ),
                        ),
                    );
                }

                return toMerge(of(vd));
            },
        }),
    );
}

function getDraftWithFilter(
    storageItem: TStorageDashboard,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    fetchDashboardDraft$: ReturnType<typeof fetchDashboardDraftFactory>,
    updatesChecker: UpdatesChecker,
): Observable<TValueDescriptor2<TFullDashboard>> {
    const dashboardItemKey: TStorageDashboardItemKey = { storageId: storageItem.id };

    return fetchDashboardDraft$(storageItem.id, storageItem.draftDigest).pipe(
        switchMapValueDescriptor(({ value }) => {
            const skipUpdate = updatesChecker.checkHasUpdateAndReset(storageItem.id, value);

            const cache = memoryDashboardsSubject.getValue();

            if (!skipUpdate) {
                updatesChecker.clearSpace(storageItem.id);
            }

            const fullDashboard = cache.get(dashboardItemKey);

            if (isNil(fullDashboard) || !skipUpdate) {
                memoryDashboardsSubject.next(DashboardsMemoryCache.remove(cache, dashboardItemKey));

                return configToDashboard(storageItem, value);
            }

            const updatedFullDashboard: TFullStorageDashboard = {
                ...fullDashboard,
                item: storageItem,
            };

            memoryDashboardsSubject.next(DashboardsMemoryCache.set(cache, updatedFullDashboard));

            return of(createSyncedValueDescriptor(updatedFullDashboard));
        }),
    );
}

function getConfig(
    storageItem: TStorageDashboard,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    fetchDashboardConfig$: ReturnType<typeof fetchDashboardConfigFactory>,
    updatesChecker: UpdatesChecker,
): Observable<TValueDescriptor2<TFullDashboard>> {
    const dashboardItemKey: TStorageDashboardItemKey = { storageId: storageItem.id };

    return fetchDashboardConfig$(storageItem.id, storageItem.digest).pipe(
        switchMapValueDescriptor(({ value }) => {
            updatesChecker.clearSpace(storageItem.id);

            const draftDashboards = memoryDashboardsSubject.getValue();
            const draftDashboard = draftDashboards.get(dashboardItemKey);

            if (
                isNil(draftDashboard) ||
                !isReadonlyDashboardsStorageItem(storageItem) ||
                storageItem.digest !== draftDashboard.item.digest
            ) {
                memoryDashboardsSubject.next(
                    DashboardsMemoryCache.remove(draftDashboards, dashboardItemKey),
                );
            }

            return configToDashboard(storageItem, value);
        }),
    );
}

function configToDashboard(
    storageItem: TStorageDashboard,
    value: TStorageDashboardConfig,
): Observable<TValueDescriptor2<TFullDashboard>> {
    return from(convertXMLToDashboard(value)).pipe(
        map(
            (dashboard): TValueDescriptor2<TFullDashboard> =>
                createSyncedValueDescriptor({
                    storageDashboardItemKey: { storageId: storageItem.id },
                    item: storageItem,
                    dashboard,
                }),
        ),
        catchError((e: Error) =>
            of(
                createUnsyncedValueDescriptor(
                    Fail(EGrpcErrorCode.FAILED_PRECONDITION, {
                        message: `Failed to parse dashboard: ${e.message}`,
                    }),
                ),
            ),
        ),
    );
}

function fixDashboardName(
    fullDashboard: TFullDashboard,
    name: TStorageDashboardName,
): TFullDashboard {
    if (fullDashboard.dashboard.name === name) {
        return fullDashboard;
    }

    return {
        ...fullDashboard,
        dashboard: {
            ...fullDashboard.dashboard,
            name,
        },
    };
}

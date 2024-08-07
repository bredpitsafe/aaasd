import { generateTraceId } from '@common/utils';
import { assert, assertNever } from '@common/utils/src/assert.ts';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import type {
    TStorageDashboard,
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
    switchMapValueDescriptor,
    tapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { BehaviorSubject, MonoTypeOperatorFunction, Observable, UnaryFunction } from 'rxjs';
import { from, of, pipe } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

import type {
    TFullDashboard,
    TFullIndicatorsDashboard,
    TFullRobotDashboard,
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
import { ModuleSubscribeToDashboard } from '../actions/dashboardsStorage/createDashboardSubscriptionFactory';
import { ModuleFetchDashboardConfig } from '../actions/dashboardsStorage/fetchDashboardConfigFactory';
import { ModuleFetchDashboardDraft } from '../actions/dashboardsStorage/fetchDashboardDraftFactory';
import { getExternalRobotDashboard } from '../actions/externalDashboards/getExternalRobotDashboard.ts';
import { getIndicatorsDashboard } from '../actions/externalDashboards/getIndicatorsDashboard.ts';
import { SubscribeToDashboardProcedureDescriptor } from '../descriptors';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

export function dashboardEffect(
    ctx: TContextRef,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const getRobotDashboard$ = getExternalRobotDashboard.bind(null, ctx);
    const getIndicatorsDashboard$ = getIndicatorsDashboard.bind(null, ctx);
    const getStorageDashboards$ = (
        dashboardItemKey: TStorageDashboardItemKey,
    ): Observable<TValueDescriptor2<TFullDashboard>> => {
        return subscribeToStorageDashboard(
            ctx,
            dashboardItemKey,
            updatesChecker,
            memoryDashboardsSubject,
        );
    };

    register(SubscribeToDashboardProcedureDescriptor, (dashboardItemKey) => {
        if (isStorageDashboardItemKey(dashboardItemKey)) {
            return getStorageDashboards$(dashboardItemKey);
        }

        if (isRobotDashboardItemKey(dashboardItemKey)) {
            return getRobotDashboard$(
                dashboardItemKey.socket,
                dashboardItemKey.robotId,
                dashboardItemKey.dashboard,
                dashboardItemKey.snapshotDate,
                dashboardItemKey.backtestingId,
            ).pipe(
                mapValueDescriptor(
                    ({ value: dashboard }): TValueDescriptor2<TFullRobotDashboard> => {
                        return createSyncedValueDescriptor({
                            robotDashboardKey: dashboardItemKey,
                            item: { hasDraft: false },
                            dashboard,
                        });
                    },
                ),
                registerMemoryDashboard(memoryDashboardsSubject, memoryOriginalDashboardsSubject),
                switchMapValueDescriptor(() => {
                    return memoryDashboardsSubject.pipe(
                        map((cache) => {
                            const dashboard = cache.get(dashboardItemKey);
                            assert(!isNil(dashboard), 'Robot dashboard is not found in cache');
                            return createSyncedValueDescriptor(dashboard);
                        }),
                    );
                }),
            );
        }

        if (isIndicatorsDashboardItemKey(dashboardItemKey)) {
            return getIndicatorsDashboard$(
                dashboardItemKey.socket,
                dashboardItemKey.indicators,
                dashboardItemKey.focusTo,
            ).pipe(
                map(
                    (dashboard): TValueDescriptor2<TFullIndicatorsDashboard> =>
                        createSyncedValueDescriptor({
                            indicatorsDashboardKey: dashboardItemKey,
                            item: { hasDraft: false },
                            dashboard,
                        }),
                ),
                registerMemoryDashboard(memoryDashboardsSubject, memoryOriginalDashboardsSubject),
                switchMapValueDescriptor(() => {
                    return memoryDashboardsSubject.pipe(
                        map((cache) => {
                            const dashboard = cache.get(dashboardItemKey);
                            assert(!isNil(dashboard), 'Indicator dashboard is not found in cache');
                            return createSyncedValueDescriptor(dashboard);
                        }),
                    );
                }),
            );
        }

        assertNever(dashboardItemKey);
    });
}

export const subscribeToStorageDashboard = dedobs(
    (
        ctx: TContextRef,
        dashboardItemKey: TStorageDashboardItemKey,
        updatesChecker: UpdatesChecker,
        memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    ): Observable<TValueDescriptor2<TFullDashboard>> => {
        const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);

        updatesChecker.openSpace(dashboardItemKey.storageId);

        return subscribeToDashboard(
            { id: dashboardItemKey.storageId },
            { traceId: generateTraceId() },
        ).pipe(
            updateCacheAndFilterUpdates(
                ctx,
                dashboardItemKey,
                updatesChecker,
                memoryDashboardsSubject,
            ),
        );
    },
    {
        normalize: ([ctx, dashboardItemKey, updatesChecker, memoryDashboardsSubject]) =>
            semanticHash.get(
                {
                    ctx,
                    dashboardItemKey,
                    updatesChecker,
                    memoryDashboardsSubject,
                },
                {
                    ctx: semanticHash.withHasher(shallowHash),
                    dashboardItemKey: semanticHash.withHasher<TStorageDashboardItemKey>(
                        (v) => v.storageId,
                    ),
                    updatesChecker: semanticHash.withHasher(shallowHash),
                    memoryDashboardsSubject: semanticHash.withHasher(shallowHash),
                },
            ),
        resetDelay: 0,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

function updateCacheAndFilterUpdates(
    ctx: TContextRef,
    dashboardItemKey: TStorageDashboardItemKey,
    updatesChecker: UpdatesChecker,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): UnaryFunction<
    Observable<TValueDescriptor2<TStorageDashboard>>,
    Observable<TValueDescriptor2<TFullDashboard>>
> {
    let isFirstResponse = true;

    return pipe(
        distinctValueDescriptorUntilChanged(),
        switchMapValueDescriptor({
            synced: ({ value: storageItem }) => {
                isFirstResponse = false;

                const fullDashboard$ = storageItem.hasDraft
                    ? getDraftWithFilter(ctx, storageItem, memoryDashboardsSubject, updatesChecker)
                    : getConfig(ctx, storageItem, memoryDashboardsSubject, updatesChecker);

                return fullDashboard$.pipe(
                    // We skip all loading states, cause this is part of subscription pipe
                    // and we want to hide this pull strategy from the user
                    filter((vd) => isSyncedValueDescriptor(vd) || isFailValueDescriptor(vd)),
                    distinctValueDescriptorUntilChanged(),
                    switchMapValueDescriptor(({ value: fullDashboard }) =>
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
                );
            },
            unsynced: (vd) => {
                if (vd.fail?.code === EGrpcErrorCode.PERMISSION_DENIED && !isFirstResponse) {
                    // TODO: how to correct describe this workaround for user?
                    return of(
                        createUnsyncedValueDescriptor(
                            Fail(EGrpcErrorCode.NOT_FOUND, {
                                message: 'Can not find dashboard',
                            }),
                        ),
                    );
                }

                return of(vd);
            },
        }),
    );
}

function getDraftWithFilter(
    ctx: TContextRef,
    storageItem: TStorageDashboard,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updatesChecker: UpdatesChecker,
): Observable<TValueDescriptor2<TFullDashboard>> {
    const fetchDashboardDraft = ModuleFetchDashboardDraft(ctx);
    const dashboardItemKey: TStorageDashboardItemKey = { storageId: storageItem.id };

    return fetchDashboardDraft(
        { id: storageItem.id, digest: storageItem.draftDigest },
        { traceId: generateTraceId() },
    ).pipe(
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
    ctx: TContextRef,
    storageItem: TStorageDashboard,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updatesChecker: UpdatesChecker,
): Observable<TValueDescriptor2<TFullDashboard>> {
    const fetchDashboardConfig = ModuleFetchDashboardConfig(ctx);
    const dashboardItemKey: TStorageDashboardItemKey = { storageId: storageItem.id };

    return fetchDashboardConfig(storageItem, { traceId: generateTraceId() }).pipe(
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

function registerMemoryDashboard(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): MonoTypeOperatorFunction<TValueDescriptor2<TFullRobotDashboard | TFullIndicatorsDashboard>> {
    return tapValueDescriptor<TValueDescriptor2<TFullRobotDashboard | TFullIndicatorsDashboard>>(
        ({ value: fullDashboard }) => {
            memoryOriginalDashboardsSubject.next(
                DashboardsMemoryCache.set(
                    memoryOriginalDashboardsSubject.getValue(),
                    fullDashboard,
                ),
            );
            memoryDashboardsSubject.next(
                DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), fullDashboard),
            );
        },
    );
}

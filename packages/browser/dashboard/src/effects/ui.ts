import type { TContextRef } from '@frontend/common/src/di';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { isRunningInIframe } from '@frontend/common/src/utils/environment';
import { tapDesc } from '@frontend/common/src/utils/Rx/desc';
import { fromLocalStorage, saveToLocalStorage } from '@frontend/common/src/utils/Rx/localStorage';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { logger } from '@frontend/common/src/utils/Tracing';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { fromEvent, merge } from 'rxjs';
import { skip, tap } from 'rxjs/operators';

import { ModuleDashboardActions } from '../modules/actions';
import { ModuleDashboardsStorage } from '../modules/actions/fullDashboards';
import { ModuleUI } from '../modules/ui/module';
import type { TFullDashboard } from '../types/fullDashboard';
import { isStorageDashboardItem } from '../types/fullDashboard/guards';
import { hasDraftDashboardItem, isReadonlyDashboardsStorageItem } from '../utils/dashboards';

export function initUIEffects(ctx: TContextRef): void {
    syncDashboardNameToPageTitle(ctx);
    confirmationForInMemoryDrafts(ctx);

    void syncUIWithStore(ctx);
}

function syncDashboardNameToPageTitle(ctx: TContextRef): void {
    const { currentDashboard$ } = ModuleDashboardActions(ctx);

    updateWindowName();

    currentDashboard$.subscribe(updateWindowName);
}

function updateWindowName(dashboardStreamEnvelope?: TValueDescriptor2<TFullDashboard>) {
    if (isNil(dashboardStreamEnvelope) || !isSyncedValueDescriptor(dashboardStreamEnvelope)) {
        document.title = 'Dashboard';
        return;
    }

    document.title = dashboardStreamEnvelope.value.dashboard.name;
}

enum EUISettingsStoreKeys {
    CompactMode = 'dashboard:ui:compactMode',
    SyncModeMap = 'dashboard:ui:syncModeMap',
}

async function syncUIWithStore(ctx: TContextRef): Promise<void> {
    await Promise.all([restoreFromStore(ctx), saveToStore(ctx)]);
}

async function restoreFromStore(ctx: TContextRef): Promise<void> {
    const { error } = ModuleNotifications(ctx);
    const { toggleCompactMode, setSyncModeMap } = ModuleUI(ctx);

    const restoreCompactMode$ = fromLocalStorage<boolean>(EUISettingsStoreKeys.CompactMode).pipe(
        tap((value) => {
            typeof value === 'boolean' && toggleCompactMode(value);
        }),
    );

    const restoreSyncModes$ = fromLocalStorage<Record<string, boolean>>(
        EUISettingsStoreKeys.SyncModeMap,
    ).pipe(
        tap((value) => {
            value !== null && setSyncModeMap(value);
        }),
    );

    merge(restoreCompactMode$, restoreSyncModes$)
        .pipe(
            tapError((err) => {
                error({
                    message: 'Error on restore UI state from local store',
                    description: err.message,
                });
                logger.error(err);
            }),
        )
        .subscribe();
}

async function saveToStore(ctx: TContextRef): Promise<void> {
    const { error } = ModuleNotifications(ctx);
    const { compactMode$, syncModeMap$ } = ModuleUI(ctx);

    const saveCompactMode$ = compactMode$.pipe(
        skip(1), // skip default value
        saveToLocalStorage(EUISettingsStoreKeys.CompactMode),
    );

    const saveSyncModeMap$ = syncModeMap$.pipe(
        skip(1), // skip default value
        saveToLocalStorage(EUISettingsStoreKeys.SyncModeMap),
    );

    merge(saveCompactMode$, saveSyncModeMap$)
        .pipe(
            tapError((err) => {
                error({
                    message: 'Error on save UI state to local store',
                    description: err.message,
                });
                logger.error(err);
            }),
            progressiveRetry(),
        )
        .subscribe();
}

function confirmationForInMemoryDrafts(ctx: TContextRef) {
    const { dashboardList$ } = ModuleDashboardsStorage(ctx);

    let hasDraft = false;

    dashboardList$
        .pipe(
            tapDesc({
                synchronized: (list) => {
                    hasDraft = list.some((item) =>
                        isStorageDashboardItem(item)
                            ? isReadonlyDashboardsStorageItem(item.item) &&
                              hasDraftDashboardItem(item.item)
                            : hasDraftDashboardItem(item.item),
                    );
                },
            }),
        )
        .subscribe();

    fromEvent(window, 'beforeunload').subscribe((event) => {
        if (hasDraft && !isRunningInIframe()) {
            event.preventDefault();
            event.returnValue = true;
        }
    });
}

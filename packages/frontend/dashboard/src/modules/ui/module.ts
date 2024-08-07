import type { Milliseconds } from '@common/types';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { createObservableBox } from '@frontend/common/src/utils/rx';
import memoize from 'memoizee';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TDashboardItemKey } from '../../types/fullDashboard';
import { getUniqueDashboardItemKey } from '../../utils/dashboards';
import { ModuleSubscribeToDashboardsUpdateProgress } from './dashboard/getIsDashboardUpdating';

function createSyncModule() {
    const { obs, get, set } = createObservableBox<Record<string, boolean>>({});

    return {
        syncModeMap$: obs,
        setSyncModeMap: set,

        getSyncMode$: memoize(
            (itemKey: TDashboardItemKey) =>
                obs.pipe(map((record) => record[getUniqueDashboardItemKey(itemKey)])),
            {
                primitive: false,
                max: 10,
            },
        ),
        getSyncMode: (itemKey: TDashboardItemKey) => get()[getUniqueDashboardItemKey(itemKey)],
        toggleSyncMode: (itemKey: TDashboardItemKey, state?: boolean): void => {
            const id = getUniqueDashboardItemKey(itemKey);
            return set((record) => ({ ...record, [id]: state ?? !record[id] }));
        },
    };
}

function createCompactModeModule() {
    const { obs, get, set } = createObservableBox(false);

    return {
        compactMode$: obs,
        getCompactMode: get,
        toggleCompactMode: (state?: boolean): void => set(state ?? !get()),
    };
}

function createChartsModule() {
    const boxCurrentChartsTime = createObservableBox<undefined | Milliseconds>(undefined);

    return {
        currentChartsTime$: boxCurrentChartsTime.obs,
        getCurrentChartsTime: boxCurrentChartsTime.get,
        setCurrentChartsTime: boxCurrentChartsTime.set,
    };
}

function createDashboardsModule(ctx: TContextRef) {
    const getDashboardsUpdateProgress = ModuleSubscribeToDashboardsUpdateProgress(ctx);
    const currentDashboardItemSubject = new ReplaySubject<undefined | TDashboardItemKey>(1);

    return {
        getDashboardsUpdateProgress,
        currentDashboardItemKey$: currentDashboardItemSubject,
        setCurrentDashboardItemKey: currentDashboardItemSubject.next.bind(
            currentDashboardItemSubject,
        ),
    };
}

function createModule(ctx: TContextRef) {
    return {
        ...createDashboardsModule(ctx),

        ...createChartsModule(),

        ...createCompactModeModule(),

        ...createSyncModule(),
    };
}

export const ModuleUI = ModuleFactory(createModule);

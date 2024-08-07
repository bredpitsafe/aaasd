import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { useModule } from '@frontend/common/src/di/react';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModuleSubscribeToCurrentDashboard } from '../../modules/actions/dashboards/currentDashboardSubscription';
import { ModuleDeletePanel } from '../../modules/actions/dashboards/deletePanel';
import { ModuleUpdatePanelsLayouts } from '../../modules/actions/dashboards/updatePanelsLayouts';
import { ModuleDashboardRouter } from '../../modules/router/module';
import { ModuleUI } from '../../modules/ui/module';
import type { TPanelGridCell, TPanelId } from '../../types/panel';
import { EDashboardRoutes } from '../../types/router';
import { getDashboardItemKeyFromDashboard } from '../../utils/dashboards';
import { getSeedSyncDataPosition } from './utils';
import { DashboardView } from './view';

export const ConnectedLayout = memo(() => {
    const { getSyncMode$, compactMode$ } = useModule(ModuleUI);
    const { getState, state$ } = useModule(ModuleDashboardRouter);
    const deletePanel = useModule(ModuleDeletePanel);
    const updatePanelsLayouts = useModule(ModuleUpdatePanelsLayouts);
    const subscribeToDashboard = useModule(ModuleSubscribeToCurrentDashboard);

    const dashboardDescriptor = useNotifiedValueDescriptorObservable(
        subscribeToDashboard(undefined, { traceId: generateTraceId() }),
    );
    const dashboardItemKey =
        dashboardDescriptor.value && getDashboardItemKeyFromDashboard(dashboardDescriptor.value);

    const showDashboardSidebar = useSyncObservable(
        useMemo(
            () => state$.pipe(map((state) => state.route.name === EDashboardRoutes.Default)),
            [state$],
        ),
        false,
    );

    const syncMode = useSyncObservable(
        useMemo(
            () => (isNil(dashboardItemKey) ? of(false) : getSyncMode$(dashboardItemKey)),
            [getSyncMode$, dashboardItemKey],
        ),
        false,
    );

    const syncSeedData = useMemo(
        () => (isNil(dashboardItemKey) ? undefined : getSeedSyncDataPosition(getState())),
        [getState, dashboardItemKey],
    );

    const compactMode = useSyncObservable(
        useMemo(
            () => (isNil(dashboardItemKey) ? of(false) : compactMode$),
            [dashboardItemKey, compactMode$],
        ),
        false,
    );

    const [cbDeleteCell] = useNotifiedObservableFunction(
        (panelId: TPanelId) => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return deletePanel(panelId, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({
                loading: 'Updating dashboard draft',
                success: 'Dashboard draft updated',
            }),
        },
    );

    const [cbUpdateLayouts] = useNotifiedObservableFunction(
        (layouts: TPanelGridCell[]) => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return updatePanelsLayouts(layouts, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({
                loading: 'Updating dashboard draft',
                success: 'Dashboard draft updated',
            }),
        },
    );

    return (
        <DashboardView
            syncMode={syncMode}
            syncSeedData={syncSeedData}
            compactMode={compactMode}
            showDashboardSidebar={showDashboardSidebar}
            dashboardDescriptor={dashboardDescriptor}
            onDeletePanel={cbDeleteCell}
            onUpdateLayouts={cbUpdateLayouts}
        />
    );
});

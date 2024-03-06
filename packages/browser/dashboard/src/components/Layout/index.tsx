import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { firstValueFrom, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModuleDashboardActions } from '../../modules/actions';
import { ModuleDashboardRouter } from '../../modules/router/module';
import { ModuleUI } from '../../modules/ui/module';
import type { TPanelGridCell, TPanelId } from '../../types/panel';
import { EDashboardRoutes } from '../../types/router';
import { getDashboardItemKeyFromDashboard } from '../../utils/dashboards';
import { useConnectedDashboard } from './hooks/useConnectedDashboard';
import { getSeedSyncDataPosition } from './utils';
import { DashboardView } from './view';

export const ConnectedLayout = memo(() => {
    const { getSyncMode$, compactMode$ } = useModule(ModuleUI);
    const { updatePanelsLayouts, deletePanel } = useModule(ModuleDashboardActions);
    const { getState, state$ } = useModule(ModuleDashboardRouter);

    const dashboardDescriptor = useConnectedDashboard();

    const dashboardItemKey = useMemo(
        () =>
            isSyncedValueDescriptor(dashboardDescriptor)
                ? getDashboardItemKeyFromDashboard(dashboardDescriptor.value)
                : undefined,
        [dashboardDescriptor],
    );

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

    const cbDeleteCell = useFunction(async (panelId: TPanelId) => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        await firstValueFrom(deletePanel(generateTraceId(), panelId));
    });

    const cbUpdateLayouts = useFunction(async (layouts: TPanelGridCell[]) => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        await firstValueFrom(updatePanelsLayouts(generateTraceId(), layouts));
    });

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
